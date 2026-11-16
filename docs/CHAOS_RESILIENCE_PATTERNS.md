# Testing Frontend Resilience with Chaos Latency

Validate frontend error handling under adverse network conditions:
- **Exponential Backoff**: Test that retry logic does not DDoS backend services.
- **Circuit Breakers**: Verify that frontend falls back to cached data when failure rates spike above 50%.
