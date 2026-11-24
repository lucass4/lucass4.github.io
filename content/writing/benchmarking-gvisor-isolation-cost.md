---
title: "Benchmarking gVisor: How Much Does Isolation Cost?"
draft: true
tags: ["gvisor", "containers", "linux", "performance"]
description: "Measuring gVisor against runc on one ARM64 VM: SHA-256 hashing, Directfs versus Gofer-only filesystem operations, Redis with and without pipelining, and repeated getpid() calls."
---

In my [previous article](/writing/understanding-gvisor-container-isolation/), I explored
how gVisor isolates containers by intercepting syscalls and handling them through the
Sentry.

One thing I didn't cover was performance.

Moving syscalls out of the host kernel's normal execution path introduces overhead, but I
wanted to understand how much of that overhead would show up in different workloads.

I ran a few experiments comparing CPU-intensive work, filesystem operations, Redis, and
repeated syscalls.

The results varied quite a bit. SHA-256 hashing performed almost identically under both
runtimes, while Redis throughput dropped considerably. Filesystem operations showed
another set of trade-offs.

## The test environment

I used an ARM64 Ubuntu VM running through Lima on my Mac, with Docker and gVisor
installed.

For the comparisons, I used three runtime configurations:

- `runc`: Standard Docker containers.
- `runsc-direct`: gVisor with Directfs enabled.
- `runsc-gofer`: gVisor with Directfs disabled.

The gVisor containers used Systrap.

I ran everything locally, without dedicated CPU cores or a controlled benchmarking
environment. The filesystem tests used a bind-mounted directory, and the Redis benchmarks
used Docker's published ports.

These are measurements from my machine. They're useful for understanding the differences
between execution paths, but I wouldn't use the numbers as production performance
estimates.

## CPU-intensive work was almost unaffected

I started with a workload that would spend most of its time executing CPU instructions
rather than interacting with the kernel.

Using Python's `hashlib`, I calculated SHA-256 hashes over an 8 MiB buffer, repeating the
operation 256 times. Each timed run processed 2 GiB of data, reusing the same buffer.

I collected nine measurements under each runtime.

| Runtime | Median execution time |
|---|---:|
| `runc` | 0.787 seconds |
| `runsc-direct` | 0.800 seconds |

That's approximately 1.7% slower under gVisor.

At that level, I wouldn't draw much of a conclusion about the performance difference.
Small variations in scheduling, CPU frequency, and the VM itself could account for some of
it.

This makes sense given how gVisor works. Applications execute native CPU instructions. The
Sentry implements Linux syscalls, but it doesn't emulate every instruction executed by the
application.

For this particular test, most of the work happened inside the SHA-256 implementation.

## Directfs versus the Gofer

In the first article, I looked at how the Gofer provides access to host-backed filesystems
and how Directfs changes that path.

Without Directfs, operations that require the backing filesystem go through the Gofer.
With Directfs, the Sentry can perform certain operations using restricted file descriptors
supplied by the Gofer.

I wrote a small Python benchmark that repeatedly created, read, inspected, and deleted
files in a bind-mounted directory.

Each test performed 1,000 operations. I ran the tests multiple times using both gVisor
configurations. The table shows the mean of those runs.

These were the results:

| Operation | Directfs | Gofer-only | Directfs speedup |
|---|---:|---:|---:|
| Create | 58.36 ms | 254.28 ms | 4.4× |
| Read | 32.82 ms | 235.90 ms | 7.2× |
| Stat | 3.83 ms | 46.28 ms | 12.1× |
| Delete | 6.71 ms | 161.27 ms | 24.0× |


{{< bars label="Mean time for 1,000 operations, both under gVisor" caption="Shorter is faster. The filesystem test had no `runc` run, so this compares the two gVisor configurations only." >}}
## Create :: 4.4× faster with Directfs
Directfs* :: 58.36 :: 58.36 ms
Gofer-only :: 254.28 :: 254.28 ms
## Read :: 7.2×
Directfs* :: 32.82 :: 32.82 ms
Gofer-only :: 235.90 :: 235.90 ms
## Stat :: 12.1×
Directfs* :: 3.83 :: 3.83 ms
Gofer-only :: 46.28 :: 46.28 ms
## Delete :: 24.0×
Directfs* :: 6.71 :: 6.71 ms
Gofer-only :: 161.27 :: 161.27 ms
{{< /bars >}}

The difference in file deletion stood out. The Gofer-only configuration took roughly 24
times longer for the same number of operations.

That overhead comes from more than the filesystem operation itself.

When the Sentry needs the Gofer to access the backing filesystem, it has to communicate
with another process. Repeating that interaction thousands of times adds up.

Directfs avoids many of those round trips.

There are limits to what these numbers tell us. I used small files on a local bind mount,
and caching affects the results. This wasn't a test of disk throughput or durable writes.

It's also important that I was comparing two gVisor configurations. These numbers don't
tell us how Directfs compares with native Linux filesystem performance.

Still, the results explain why Directfs is enabled by default.

There's a security consideration too. Directfs requires the Sentry to have additional
permissions for filesystem operations. Disabling it allows a more restricted Sentry, at
the cost of additional communication with the Gofer.

Whether that trade-off makes sense depends on the workload and its threat model.

## Redis: a more realistic workload

I chose Redis because it's straightforward to deploy, has a built-in benchmarking tool,
and is sensitive to request latency.

I started two Redis 7 containers, one using `runc` and the other using gVisor with
Directfs enabled.

I disabled persistence to avoid adding disk writes to the comparison.

```bash
docker run -d --name redis-native \
  --runtime=runc \
  -p 127.0.0.1:6380:6379 \
  redis:7-alpine \
  redis-server --save "" --appendonly no

docker run -d --name redis-gvisor \
  --runtime=runsc-direct \
  -p 127.0.0.1:6381:6379 \
  redis:7-alpine \
  redis-server --save "" --appendonly no
```

I used `redis-benchmark` with 20 concurrent connections and 100,000 requests for each
test.

First, I ran GET and SET without pipelining:

```bash
redis-benchmark -h 127.0.0.1 -p 6380 \
  -n 100000 -c 20 -P 1 -t get,set -q

redis-benchmark -h 127.0.0.1 -p 6381 \
  -n 100000 -c 20 -P 1 -t get,set -q
```

| Operation | `runc` | gVisor |
|---|---:|---:|
| SET | 152,672 req/s | 45,228 req/s |
| GET | 151,745 req/s | 46,598 req/s |

Under these conditions, gVisor delivered approximately 30% of the throughput I measured
with `runc`.

Median request latency was also higher, around 0.4 ms under gVisor compared with roughly
0.1 ms under `runc`.

I wouldn't attribute all of this to syscall interception.

Redis involves networking, scheduling, memory access, and application logic. gVisor also
uses a different networking implementation, and the published-port configuration adds its
own behavior.

There's enough happening here that the benchmark can't isolate one specific source of
overhead.

But it raised another question. Would the difference become smaller if Redis could
process more commands per client interaction?

## What changed with pipelining?

Redis supports pipelining, allowing clients to send multiple commands without waiting for
a response after each one.

I repeated the benchmark with a pipeline depth of 16.

```bash
redis-benchmark -h 127.0.0.1 -p 6380 \
  -n 100000 -c 20 -P 16 -t get,set -q

redis-benchmark -h 127.0.0.1 -p 6381 \
  -n 100000 -c 20 -P 16 -t get,set -q
```

| Operation | `runc` | gVisor |
|---|---:|---:|
| SET | 1,075,269 req/s | 617,284 req/s |
| GET | 1,123,596 req/s | 645,161 req/s |

With pipelining disabled, gVisor reached approximately 30% of native throughput. At a
pipeline depth of 16, that increased to about 57%.


{{< bars label="Redis throughput under gVisor, as a share of runc" max="100" reference="100" reference_label="runc throughput" caption="Pipelining made both runtimes faster, so the chart shows gVisor relative to `runc`. The tables above have the absolute values." >}}
## Pipeline depth 1
SET* :: 29.62 :: 29.6%
GET* :: 30.71 :: 30.7%
## Pipeline depth 16
SET* :: 57.41 :: 57.4%
GET* :: 57.42 :: 57.4%
{{< /bars >}}

The absolute performance gap remained significant, but the relative difference was
smaller.

Pipelining reduces the number of client round trips relative to the number of commands
being processed. More work gets done before the client needs to wait for another response.

That doesn't remove the Sentry or gVisor's networking overhead. It changes how frequently
those costs affect progress from the client's perspective.

Two applications performing similar amounts of work can behave very differently under
gVisor depending on how they interact with the operating system.

Of course, pipelining isn't always an option. Some workloads need to read a response
before deciding what to send next.

## Measuring the syscall boundary

Redis involves too many components to isolate the cost of a single syscall. I used
`getpid()` for a more focused test.

It's a simple operation. Under native Linux, the kernel returns the calling process's ID.
Under gVisor, the Sentry maintains its own process information and returns the virtual
PID.

I wrote a Python benchmark that called `os.getpid()` 200,000 times. As a rough baseline, I
also timed 200,000 calls to a no-op function, `lambda: None`, labelled "Python loop" in
the output.

```python
import os
import time
import statistics

N = 200_000

def benchmark(name, fn):
    results = []

    for _ in range(5):
        start = time.perf_counter()

        for _ in range(N):
            fn()

        results.append(time.perf_counter() - start)

    print(f"{name}: {statistics.median(results):.4f}s")

benchmark("Python loop", lambda: None)
benchmark("getpid()", os.getpid)
```

I ran it under `runc` and `runsc-direct`. I aligned the output and added the runtime
headers for readability.

```text
========== runc ==========
Python loop: 0.0047s
getpid():    0.0331s

========== runsc-direct ==========
Python loop: 0.0048s
getpid():    0.3976s
```

The no-op baseline ran in almost the same time under both runtimes.

The `getpid()` benchmark took approximately 12 times longer under gVisor.

This was the largest relative difference I observed between native execution and gVisor
in these experiments.

The syscall itself does very little work. Under Systrap, calling into the Sentry
introduces execution transitions and communication that wouldn't be needed for a normal
native syscall.

When the operation is as small as `getpid()`, that additional work becomes a large part
of the total execution time.

This is still a Python microbenchmark. The measured time includes Python function-call
overhead, and the no-op baseline doesn't perfectly isolate that cost. It also doesn't
tell us how a multi-threaded application will behave.

Most importantly, it doesn't mean applications running under gVisor will be 12 times
slower.

It shows what can happen when a workload repeatedly crosses the syscall boundary without
doing much work between calls.


{{< bars label="Time under runsc-direct, relative to runc" reference="1" reference_label="runc, 1×" caption="Medians from the SHA-256 and `getpid()` runs above. The no-op function call is the baseline for the `getpid()` benchmark." >}}
SHA-256 hashing :: 1.0165 :: 1.02×
No-op function call :: 1.0213 :: 1.02×
getpid()* :: 12.012 :: 12.0×
{{< /bars >}}

SHA-256 spent most of its time executing CPU instructions. Redis made frequent use of
networking and other system interfaces. The filesystem benchmark repeatedly exercised
access to host-backed files.

## Would I use gVisor?

I wouldn't try to put a single number on gVisor's overhead based on these experiments.
SHA-256 barely changed, Redis lost a considerable amount of throughput, and disabling
Directfs made filesystem operations much slower.

For workloads executing untrusted code, I'd be willing to accept some overhead for the
additional isolation. For latency-sensitive services, I'd want to measure the actual
application under the runtime configuration I planned to deploy.

---

**References**

- [Understanding gVisor: A Different Approach to Container
  Isolation](/writing/understanding-gvisor-container-isolation/)
- [gVisor documentation](https://gvisor.dev/)
- [Directfs: Faster filesystem access in gVisor](https://gvisor.dev/blog/2023/06/27/directfs/)
- [Systrap](https://gvisor.dev/blog/2023/04/28/systrap-release/)
