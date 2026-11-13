# ApiCrafter Architecture & Stateful Mock Mechanics

This document provides a technical walkthrough of **ApiCrafter**'s in-memory relational store, chaos engineering latency injector, and compile-time TypeScript type generator.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## Technical Pipeline

```
Inbound HTTP Client (Fetch, Axios, TanStack Query)
                      │
                      ▼
        [ Chaos Simulation Layer ]
        - Artificial Latency Injector (0 - 5000ms)
        - Probabilistic Error Generator (500 / 503 / 429)
                      │
                      ▼
      [ Stateful In-Memory Store ]
      - Collections (Users, Products, Orders, Custom)
      - Full CRUD (GET, POST, PUT, PATCH, DELETE)
      - Dynamic Query Filters (?status=active&limit=10)
                      │
                      ├────────────────────────┐
                      ▼                        ▼
       [ TypeScript Type Synthesizer ]  [ Dark-Mode Studio ]
       - Deep interface inference       - Real-time table browser
       - Exportable .ts declarations    - Chaos toggle sliders (:5050)
```

---

## 1. Zero-Dependency In-Memory Store (`src/store/memory.ts`)

ApiCrafter implements full ACID-like transactional in-memory state:
- Each item receives a stable auto-generated `id` (UUID or incremental).
- Mutations (`POST`, `PUT`, `DELETE`) immediately update the collection in-memory.
- Dynamic filtering handles pagination (`_page`, `_limit`), sorting (`_sort`, `_order`), and property matching.

---

## 2. Realistic Chaos Testing

Frontend applications often break under real-world conditions (slow 3G, server timeouts). ApiCrafter's chaos layer lets frontend teams test:
- Loading skeletons and spinners
- Retry mechanisms with exponential backoff
- Error boundaries and toast fallbacks

