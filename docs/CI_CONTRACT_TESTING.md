# Headless CI Contract Testing

Run ApiCrafter in CI pipelines for deterministic Playwright/Cypress tests:
```yaml
- name: Start Mock Contract Server
  run: node dist/bin.js start --port 5050 &
```
