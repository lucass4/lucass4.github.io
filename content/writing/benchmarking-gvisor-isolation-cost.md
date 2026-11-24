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

What matters is that both runtimes performed similarly.

This makes sense given how gVisor works. Applications execute native CPU instructions. The
Sentry implements Linux syscalls, but it doesn't emulate every instruction executed by the
application.

For this particular test, most of the work happened inside the SHA-256 implementation.

I wanted to see what happened when the workload spent more time interacting with the
system.

## Directfs versus the Gofer

In the first article, I looked at how the Gofer provides access to host-backed filesystems
and how Directfs changes that path.

Without Directfs, operations that require the backing filesystem go through the Gofer.
With Directfs, the Sentry can perform certain operations using restricted file descriptors
supplied by the Gofer.

That difference is easy to describe. I wanted to measure it.

I wrote a small Python benchmark that repeatedly created, read, inspected, and deleted
files in a bind-mounted directory.

Each test performed 1,000 operations. I ran the tests multiple times using both gVisor
configurations.

These were the results:

| Operation | Directfs | Gofer-only | Directfs speedup |
|---|---:|---:|---:|
| Create | 57.24 ms | 253.72 ms | 4.4× |
| Read | 32.10 ms | 235.09 ms | 7.3× |
| Stat | 3.87 ms | 45.98 ms | 11.9× |
| Delete | 6.72 ms | 161.25 ms | 24.0× |

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

Next, I wanted to test an application rather than an isolated filesystem operation.

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

The difference was substantial.

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

The results changed considerably.

| Operation | `runc` | gVisor |
|---|---:|---:|
| SET | 1,075,269 req/s | 617,284 req/s |
| GET | 1,123,596 req/s | 645,161 req/s |

Both runtimes became much faster.

With pipelining disabled, gVisor reached approximately 30% of native throughput. At a
pipeline depth of 16, that increased to about 57%.

The absolute performance gap remained significant, but the relative difference was
smaller.

Pipelining reduces the number of client round trips relative to the number of commands
being processed. More work gets done before the client needs to wait for another response.

That doesn't remove the Sentry or gVisor's networking overhead. It changes how frequently
those costs affect progress from the client's perspective.

This is useful when thinking about application design. Two applications performing
similar amounts of work can behave very differently under gVisor depending on how they
interact with the operating system.

Of course, pipelining isn't always an option. Some workloads need to read a response
before deciding what to send next.

## Measuring the syscall boundary

After Redis, I wanted to isolate something smaller.

Redis was useful because it behaved like a real application, but it involved too many
components to say much about the cost of an individual syscall.

I went back to `getpid()`.

It's a simple operation. Under native Linux, the kernel returns the calling process's ID.
Under gVisor, the Sentry maintains its own process information and returns the virtual
PID.

I wrote a Python benchmark that called `os.getpid()` 200,000 times. I also measured an
empty Python loop as a rough baseline.

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

I ran it under `runc` and `runsc-direct`.

```text
========== runc ==========
Python loop: 0.0047s
getpid():    0.0331s

========== runsc-direct ==========
Python loop: 0.0048s
getpid():    0.3976s
```

The empty Python loop ran in almost the same time under both runtimes.

The `getpid()` benchmark took approximately 12 times longer under gVisor.

This was the largest relative difference I observed between native execution and gVisor
in these experiments.

The syscall itself does very little work. Under Systrap, calling into the Sentry
introduces execution transitions and communication that wouldn't be needed for a normal
native syscall.

When the operation is as small as `getpid()`, that additional work becomes a large part
of the total execution time.

It's worth being careful with the result.

This is still a Python microbenchmark. The measured time includes Python function-call
overhead, and the empty-loop baseline doesn't perfectly isolate that cost. It also doesn't
tell us how a multi-threaded application will behave.

Most importantly, it doesn't mean applications running under gVisor will be 12 times
slower.

It shows what can happen when a workload repeatedly crosses the syscall boundary without
doing much work between calls.

That also helps explain the earlier results.

SHA-256 spent most of its time executing CPU instructions. Redis made frequent use of
networking and other system interfaces. The filesystem benchmark repeatedly exercised
access to host-backed files.

Different execution patterns, different costs.

## Would I use gVisor?

These experiments left me with five observations:

| Workload | What I measured |
|---|---|
| SHA-256 hashing | Around 2% difference between `runc` and gVisor |
| Filesystem operations | Directfs 4–24× faster than Gofer-only |
| Redis, pipeline depth 1 | gVisor reached around 30% of `runc` throughput |
| Redis, pipeline depth 16 | gVisor reached around 57% of `runc` throughput |
| Repeated `getpid()` | Around 12× longer under gVisor |

I wouldn't combine these numbers into a single estimate of gVisor's overhead. They're
different workloads, and the filesystem comparison doesn't even include `runc`.

For me, the more useful question is what the application actually spends its time doing.

If a workload mostly executes CPU instructions, gVisor may add very little measurable
overhead. If it frequently interacts with the filesystem or network, I'd want to examine
those paths more carefully.

For workloads executing untrusted code, I'd be willing to accept some overhead in exchange
for the additional isolation boundary. For a latency-sensitive service, I'd want to
benchmark the real application before deciding.

These tests didn't change my opinion of gVisor's security model. They gave me a better
understanding of what I'd need to measure before using it.

---

**References**

- [Understanding gVisor: A Different Approach to Container
  Isolation](/writing/understanding-gvisor-container-isolation/)
- [gVisor documentation](https://gvisor.dev/)
- [Directfs: Faster filesystem access in gVisor](https://gvisor.dev/blog/2023/06/27/directfs/)
- [Systrap](https://gvisor.dev/blog/2023/04/28/systrap-release/)
