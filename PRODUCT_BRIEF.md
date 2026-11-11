# ApiCrafter — Product Brief

**Product Name:** `apicrafter` (CLI: `apicrafter`)  
**Date:** 2026-11-11  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))  
**GitHub Repository:** `https://github.com/raghav1924/apicrafter`  
**License:** MIT  

---

## 1. Executive Summary & Problem Discovery
In late 2026, building modern web applications, AI agent tools, and full-stack frontends (Next.js, React) requires interacting with dozens of backend APIs.
However, frontend developers and indie founders hit severe bottlenecks:
1. **Unfinished or Stalled Backends:** Frontend developers wait days for backend APIs or third-party sandboxes to be deployed before building UIs.
2. **Brittle Static JSON Stubs:** Traditional mock tools return static JSON files that lack state. When a user creates (`POST`), updates (`PUT/PATCH`), or deletes (`DELETE`) a resource, traditional mock servers don't persist changes in-memory.
3. **No Chaos or Latency Simulation:** Developers cannot test loading states, skeleton screens, random rate limits (429s), or server errors (500s) without modifying application code.
4. **Heavyweight Tooling Overhead:** Tools like WireMock or Postman Mock Servers require Java runtimes, cloud accounts, or paywalled team seats.

---

## 2. Product Solution: ApiCrafter
**ApiCrafter** is a high-speed, zero-dependency OpenAPI & TypeScript Contract Mock Server, Stateful In-Memory REST Engine, Chaos Latency Simulator & Visual Studio.

### Core Capabilities:
- ⚡ **Zero-Config Instant Server:** Starts a live HTTP REST mock server in under 10ms from an OpenAPI 3.0/3.1 spec, a lightweight JSON contract, or automatic auto-generated resource schemas (`/api/users`, `/api/products`, etc.).
- 🧠 **Stateful In-Memory CRUD Engine:** Truly supports stateful mutations! `POST /api/items` actually adds items into local in-memory storage; `GET /api/items/:id` retrieves them; `PUT /api/items/:id` updates them; `DELETE` removes them. Reset on demand.
- 🎲 **Faker & Contract Synthesizer:** Automatically generates realistic mock data (UUIDs, names, emails, avatars, timestamps, prices, statuses) based on field names and JSON Schema types.
- 🌪️ **Chaos & Latency Injection:**
  - Jitter/Latency: `--delay 300` or random delay ranges (`--delay-range 100-800ms`) to test UI loading skeletons and spinner states.
  - Error Rates: `--chaos-rate 0.2` to simulate 20% random HTTP 500/503/429 failures to verify frontend error boundaries.
- 🌐 **Interactive Dark-Mode Web Studio (`http://localhost:5050`):**
  - Visual endpoint catalog with live request tester
  - Real-time in-memory database table viewer (inspect, add, delete mock rows directly from browser UI)
  - Interactive chaos & delay controls (toggle latency or error rates with sliders in real time)
  - One-click copyable `curl` and `fetch()` code snippets
- 📄 **TypeScript Type Generator (`--types`):** Emits clean TypeScript interface declarations corresponding to active mock schemas for end-to-end type safety.
- 🚀 **Zero External Dependencies:** Built with pure TypeScript and Node.js standard libraries (`http`, `url`, `crypto`).

---

## 3. Tech Stack & Architecture
- **Language:** TypeScript 5.9 (Strict mode)
- **Runtime:** Node.js (>=18.0.0, zero external dependencies)
- **State Management:** In-memory reactive collection store with CRUD indexing
- **Design System:** Dark-mode terminal typography + Responsive Web Studio (CSS Variables, Flexbox/Grid, real-time polling)
- **Testing:** Native Node.js test runner (`node:test`, `node:assert`)
