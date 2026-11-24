---
title: "Understanding gVisor: A Different Approach to Container Isolation"
date: 2026-11-24
tags: ["gvisor", "containers", "linux", "security", "kubernetes"]
description: "Exploring how gVisor isolates containers using a user-space kernel, the Sentry and Gofer, with hands-on experiments examining processes, security boundaries, and syscall compatibility."
---

I've been working with containers for years, but I hadn't spent much time thinking about
what actually happens when a containerized application makes a system call.

We usually describe containers in terms of namespaces, cgroups, capabilities, and seccomp.
These are the Linux mechanisms that give processes their own view of the system, control
resource usage, and restrict what they're allowed to do.

There's one detail that matters quite a bit for security: containers still share the host
kernel.

Even with a restrictive seccomp profile, an application can call into the host kernel
through the interfaces its policy allows. If there's a vulnerability in one of those
interfaces, the container's isolation mechanisms might not be enough.

This is what got me interested in [gVisor](https://gvisor.dev/).

## Putting another kernel between the application and the host

gVisor takes a different approach to container isolation. Instead of relying
exclusively on the host Linux kernel to implement the application's system calls, it
provides its own application kernel running in user space.

That component is called the **Sentry**.

With a traditional container running through `runc`, an application calling `getpid()`
enters the host Linux kernel, which returns the process ID.

With gVisor's `runsc` runtime, the syscall is intercepted and handled by the Sentry. Since
the Sentry maintains its own process table, it can return the PID without making an
equivalent syscall to the host.

The application doesn't need to know any of this. It still sees a Linux-compatible
environment.

Conceptually, the difference looks like this:

{{< architecture svg="gvisor-syscall-path" label="Where the syscall goes" caption="With `runc`, the application's syscalls go to the host kernel. With `runsc`, Systrap hands them to the Sentry, which implements them and makes its own restricted calls to the host. Application code runs as native CPU instructions in both." >}}
[runc] Application
-> Linux syscall
[Host kernel] Host Linux kernel
[runsc] Application
-> syscall
[Interception] Systrap
-> hands off
[Application kernel, user space] Sentry*
-> restricted host operations
[Host kernel] Host Linux kernel
!! Not emulated :: Ordinary CPU instructions run natively under both runtimes. Only syscalls change path.
---
With `runc`, the application's Linux syscall goes straight to the host Linux kernel, which
implements it. With `runsc`, Systrap, gVisor's default platform, intercepts the syscall
with a seccomp trap and hands control to the Sentry. The Sentry, an application kernel in
user space, implements the Linux syscall interface and makes its own restricted host
operations. The host kernel boundary sits below the Sentry. In both cases the application
runs native CPU instructions.
{{< /architecture >}}

This reminded me of a virtual machine, and I think that's a reasonable mental model.

The difference is that gVisor doesn't need to boot a complete guest Linux kernel or
emulate virtual hardware. The application still executes native CPU instructions, while
the Sentry implements much of the Linux kernel interface the application expects.

There's also a mechanism needed to intercept those syscalls. gVisor's default platform,
**Systrap**, uses seccomp traps and shared memory to transfer control between the
application and the Sentry. There's a KVM-based platform as well, but I focused on Systrap
for these experiments.

### Seeing the Sentry in action

I set up a Linux VM using Lima on my Mac, installed Docker Engine and gVisor, and ran two
identical containers.

If you want to follow along, the [official gVisor Docker quick
start](https://gvisor.dev/docs/user_guide/quick_start/docker/) covers installing and
registering `runsc`. The experiments below assume you're running commands on a Linux host
with both runtimes available. On macOS, that means a Linux VM.

```bash
docker run -d --name native \
  --runtime=runc alpine:3.21 sleep 600

docker run -d --name gvisor \
  --runtime=runsc alpine:3.21 sleep 600
```

Then I inspected the Linux host processes:

```bash
ps -eo pid,comm,args \
  | grep -E '[s]leep 600|[r]unsc|[g]visor'
```

Part of the output looked like this (trimmed for readability):

```text
221187  sleep           sleep 600
221272  exe             runsc-gofer ...
221277  gvisor_sentry   runsc-sandbox ...
221278  runsc-fd-parkin runsc-fd-parking
221310  gvisor_sentry   [gvisor_sentry]
221325  gvisor_sentry   [gvisor_sentry]
```

With `runc`, the application appeared directly as a `sleep` process on the host.

With gVisor, I found a Sentry, a Gofer, and additional processes used by the sandbox
execution platform. The application was running, but its Linux process environment was
being managed by gVisor.

## So what about filesystem access?

This was one of my first questions.

If the Sentry handles an application's syscalls, what's stopping a malicious application
from asking it to open files outside the container?

The container runtime still defines which filesystem resources are exposed. gVisor
introduces another component called the **Gofer**, a separate process responsible for
providing access to host-backed filesystems.

The Sentry maintains the application's virtual filesystem view. When an operation
requires access to a backing filesystem, the Gofer can perform it on the Sentry's behalf.

This separation is deliberate. The Sentry processes requests from untrusted applications,
so giving it unrestricted host filesystem access would create another problem.

Directfs changes how that filesystem access works.

Originally, filesystem operations relied heavily on communication between the Sentry and
Gofer. That introduced quite a bit of overhead.

gVisor later introduced **Directfs**, which is enabled by default. With Directfs, the
Gofer provides restricted file descriptors for the container's configured mounts, allowing
the Sentry to perform certain filesystem operations directly.

{{< architecture svg="gvisor-filesystem-paths" label="Two paths to the filesystem" caption="The Gofer is a separate process in both. With Directfs it passes the Sentry file descriptors for the configured mounts, and the Sentry works relative to them without a LISAFS round trip for each host-backed operation." >}}
[Directfs disabled] Application
-> file syscall
[Sandbox process] Sentry*
-> LISAFS RPC, for host-backed operations
[Separate process] Gofer
-> performs it
[Configured mounts only] Host-backed filesystem
[Directfs enabled, the default] Application
-> file syscall
[Sandbox process] Sentry*
+[Separate process] Gofer
-> FD-relative operations, no RPC
[Configured mounts only] Host-backed filesystem
!! Mount FDs :: The Gofer opens the configured mounts and passes their file descriptors to the Sentry.
---
With Directfs disabled, the application's file syscall goes to the Sentry. Operations that
need the host-backed filesystem go to the Gofer as LISAFS RPCs. The Gofer, a separate process,
performs it on the host-backed filesystem. With Directfs enabled, the Gofer opens the
container's configured mounts and passes their file descriptors to the Sentry. The Sentry
then performs filesystem operations relative to those descriptors itself, without a round
trip to the Gofer. In both cases only the configured mounts are reachable.
{{< /architecture >}}

The Sentry still can't freely browse the host filesystem. Its access is constrained by the
filesystem resources made available to it, mount isolation, and syscall restrictions.

Directfs avoids many Gofer round trips, but the Sentry needs additional host filesystem
permissions to use it.

## What protects the host if the Sentry is compromised?

The Sentry itself is software, and software can have vulnerabilities.

gVisor accounts for this by restricting the Sentry using the same Linux security
mechanisms we're already familiar with: namespaces, capabilities, and seccomp.

I wanted to see those restrictions rather than just read about them.

### Comparing Directfs security restrictions

I registered two gVisor runtimes, one with Directfs enabled and another with it disabled:

```bash
sudo runsc install --runtime runsc-direct -- \
  --directfs=true

sudo runsc install --runtime runsc-gofer -- \
  --directfs=false

sudo systemctl restart docker
```

Then I ran identical containers and inspected the Sentry processes through `/proc`:

```bash
for runtime in runsc-direct runsc-gofer; do
  name="inspect-$runtime"

  docker run -d --name "$name" \
    --runtime="$runtime" \
    alpine:3.21 sleep 600 >/dev/null

  pid=$(docker inspect -f '{{.State.Pid}}' "$name")

  echo "===== $runtime ====="

  sudo grep -E \
    '^(CapEff|CapBnd|NoNewPrivs|Seccomp):' \
    "/proc/$pid/status"
done
```

**Directfs enabled:**

```text
CapEff:     000000000008001f
CapBnd:     000000000008001f
NoNewPrivs: 1
Seccomp:    2
```

**Directfs disabled:**

```text
CapEff:     0000000000000000
CapBnd:     0000000000000000
NoNewPrivs: 1
Seccomp:    2
```

With Directfs enabled, the Sentry had six effective Linux capabilities, including
`CAP_DAC_OVERRIDE`, `CAP_DAC_READ_SEARCH`, and `CAP_SYS_PTRACE`.

With Directfs disabled, it had no effective capabilities and an empty capability bounding
set.

Both configurations had seccomp filtering enabled, although that doesn't mean their
syscall policies were identical.

I also inspected their user namespace mappings. With Directfs disabled, the Sentry had
only UID 65534 mapped. With Directfs enabled, it had a much broader identity mapping.

{{< architecture svg="gvisor-host-protection" label="Protecting the host from the sandbox" caption="Fewer capabilities reduce what a compromised Sentry can do on the host. They don't make it secure on their own. The counts are observations from my lab, not universal values or a security rating." >}}
[Untrusted] Untrusted application
-> syscalls, first boundary
[Application kernel] Sentry*
-> restricted host operations, second boundary
[Host restrictions on the Sentry] Seccomp*, User namespace*, Capabilities*, Mount isolation*
-> filtered
[Host] Host Linux kernel
!! Observed in my lab :: Effective capabilities on the Sentry: 6 with Directfs enabled, 0 with it disabled. Not universal values or a security rating.
---
The untrusted application's syscalls cross a first boundary into the Sentry, the
application kernel. The Sentry's own host operations cross a second boundary, made of
seccomp, user namespaces, capabilities and mount isolation, before they reach the host
Linux kernel.

| Configuration | Effective capabilities, observed in my lab |
|---|---|
| Directfs enabled | 6 |
| Directfs disabled | 0 |
{{< /architecture >}}

That doesn't mean a compromised Sentry is harmless. It still has access to certain
resources and host interfaces. But it demonstrates how gVisor limits the privileges of the
component responsible for handling untrusted applications.

The capability results show why the Gofer exists. Moving filesystem operations into a
separate, restricted process allows the Sentry to operate with fewer host privileges.

The Gofer still needs access to the filesystem resources assigned to the container. Those
privileges haven't disappeared; they're separated from the process implementing the
application's kernel interface.

To remove the containers from both experiments:

```bash
docker rm -f native gvisor
docker rm -f inspect-runsc-direct inspect-runsc-gofer
```

## Where does gVisor actually make sense?

After understanding the architecture, I started thinking about where I would actually use
it.

I wouldn't replace every container runtime with gVisor. For most trusted internal
services, a properly configured container with restricted capabilities, seccomp,
appropriate filesystem permissions, and network policies may already provide sufficient
isolation.

Where gVisor becomes particularly useful is when you're running code you don't fully
control.

**Multi-tenant platforms** are an obvious example.

Imagine a platform where customers can deploy their own applications. You control the
infrastructure, but you don't control what those applications execute. Even with
Kubernetes namespaces and security policies, workloads running on the same node still
share the host kernel.

gVisor adds another isolation boundary between those workloads and the host. Each
customer or trust domain can run in a separate sandbox with its own Sentry.

This matters for serverless platforms, where workloads from different
customers may execute on shared infrastructure. Google Cloud Run is one example of a
service that uses gVisor.

Another use case is **executing user-submitted code**.

Think about an online coding environment, a platform that executes Python notebooks, or a
service that runs customer-defined functions. These workloads might execute arbitrary
code, access files, or install dependencies.

Snowflake, for example, has used gVisor to isolate untrusted user code in its Snowpark
execution environment.

**AI agents** are another case I've been thinking about.

An agent that generates code and executes it creates a security problem. Even
if the agent itself is trusted, the generated code might contain mistakes or execute
commands you didn't anticipate.

Running that code inside a gVisor sandbox gives you an additional boundary. The agent can
still work with the files and tools explicitly made available to it, but it doesn't get
direct access to the host kernel's full interface.

I can also see the value in **CI systems**, particularly when building contributions from
external developers. Build scripts and dependencies can execute arbitrary commands.
Running those jobs inside separate sandboxes can reduce the consequences of malicious or
compromised build code.

Of course, gVisor doesn't solve every security problem in these scenarios. If you mount
sensitive credentials or give the workload unrestricted access to internal services, the
application can still use those permissions. You still need to manage secrets, network
access, filesystem mounts, and tenant boundaries.

There's also the question of whether the additional isolation is worth the cost.

For a latency-sensitive service that frequently interacts with the kernel, I'd want
benchmarks before making that decision. The same applies to applications that depend on
specific Linux kernel features, privileged operations, or specialized devices.

I'd be more inclined to use gVisor for workloads where the code itself is part of the
threat model, rather than treating it as the default runtime for every application.

## Compatibility and the cost of isolation

Since gVisor implements Linux interfaces itself, some syscalls or kernel features aren't
supported.

I wanted to see how an unsupported syscall behaves in practice.

I used `mq_timedsend()`, a Linux syscall for POSIX message queues, and deliberately passed
an invalid file descriptor. This lets us check how each runtime responds without actually
sending a message.

Here's a simplified version of the test using Python:

```bash
for runtime in runc runsc; do
  echo "===== $runtime ====="

  docker run --rm -i \
    --runtime="$runtime" \
    python:3.12-alpine python - <<'PY'
import ctypes
import errno
import platform

numbers = {"aarch64": 182, "x86_64": 242}
number = numbers[platform.machine()]

libc = ctypes.CDLL(None, use_errno=True)
libc.syscall.restype = ctypes.c_long

result = libc.syscall(
    ctypes.c_long(number),
    ctypes.c_int(-1),
    ctypes.c_void_p(),
    ctypes.c_size_t(0),
    ctypes.c_uint(0),
    ctypes.c_void_p(),
)
error = ctypes.get_errno()

print(f"result={result}, errno={error} "
      f"({errno.errorcode.get(error)})")
PY
done
```

On my ARM64 Linux VM, the output was:

```text
===== runc =====
result=-1, errno=9 (EBADF)

===== runsc =====
result=-1, errno=38 (ENOSYS)
```

With `runc`, the host kernel recognized the syscall but rejected the invalid descriptor.

With `runsc`, the Sentry returned `ENOSYS`, meaning the syscall wasn't implemented.

This specific result depends on the gVisor version, architecture, and security policies,
but it demonstrates the compatibility difference I was looking for.

I also ran Redis under both runtimes. It started successfully, responded to `PING`, and
handled basic `SET` and `GET` operations under gVisor.

So an unsupported syscall doesn't necessarily prevent an application from working. It
depends on which kernel interfaces the application requires and whether it has fallback
implementations.

There's also a performance cost to intercepting syscalls and implementing kernel
functionality in user space. How much that matters depends heavily on the workload.

I ran a few experiments comparing filesystem operations, Redis, and CPU-intensive work,
and the differences were substantial. I'll cover those measurements separately because
they're worth examining in detail.

I wouldn't use gVisor for every workload. For untrusted code, the extra isolation boundary
makes sense to me. For everything else, I'd want to understand the threat model,
compatibility requirements, and performance cost before introducing it.

---

**References**

- [gVisor Docker quick start](https://gvisor.dev/docs/user_guide/quick_start/docker/)
- [gVisor architecture](https://gvisor.dev/docs/architecture_guide/intro/)
- [gVisor security model](https://gvisor.dev/docs/architecture_guide/security/)
- [gVisor filesystem documentation](https://gvisor.dev/docs/user_guide/filesystem/)
- [gVisor syscall compatibility](https://gvisor.dev/docs/user_guide/compatibility/linux/arm64/)
- [Who's using gVisor](https://gvisor.dev/users/)
