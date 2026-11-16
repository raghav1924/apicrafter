# ApiCrafter CLI Cheatsheet

```bash
# Start stateful REST mock server
apicrafter start --port 5050

# Enable synthetic chaos latency (200ms - 800ms) with 10% failure rate
apicrafter start --chaos --jitter=200-800 --failure-rate=0.10

# Generate TypeScript types from endpoints
apicrafter types --endpoint /api/users
```
