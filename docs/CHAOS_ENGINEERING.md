# Synthetic Latency & Chaos Engineering

Test frontend resiliency and error handling boundaries:
- **Jitter**: Inject artificial latency distributions (e.g. 150ms - 800ms).
- **Error Injection**: Probabilistic 500, 502, 503 responses ($p \in [0, 1]$).
- **Network Flapping**: Simulate dropped connections and socket timeouts.
