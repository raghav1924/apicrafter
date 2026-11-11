# Contributing to ApiCrafter

Thank you for your interest in contributing to **ApiCrafter**! We welcome community contributions to make frontend prototyping, stateful REST mocking, and chaos latency testing seamless and robust.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raghav1924/apicrafter.git
   cd apicrafter
   ```

2. **Compile TypeScript:**
   ```bash
   npm run build
   # or watch mode
   npm run dev
   ```

3. **Run Unit Tests:**
   ```bash
   npm test
   ```

## Pull Request Guidelines

- Ensure all existing and new unit tests pass (`npm test`).
- Maintain zero external dependencies: use Node.js standard libraries (`node:http`, `node:url`, `node:fs`).
- Write meaningful, conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`).
- Document new CLI flags or chaos simulation modes.

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all discussions and reviews.

---
Maintained by **[Jatin Sharma](https://jatinsh.netlify.app/)** • GitHub: **[@raghav1924](https://github.com/raghav1924)**
