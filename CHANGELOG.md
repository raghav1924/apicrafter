# Changelog

All notable changes to **ApiCrafter** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-11

### Added
- Stateful in-memory REST engine supporting `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` with persistent mutations.
- Chaos latency and failure simulator (`--delay <ms>`, `--chaos <rate>`) for testing frontend spinners and error boundaries.
- Modern dark-mode Web Studio on port 5050 with real-time table browser, live chaos sliders, and one-click data reset.
- Automated TypeScript interface code generator (`apicrafter types --out types.ts`).
- Dynamic realistic data faker for user profiles, product catalogs, and transactional order histories.
- Zero external runtime dependencies.

