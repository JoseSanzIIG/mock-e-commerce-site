# Mock E-Commerce Site — Copilot Instructions

## Repository Overview

This is a full-stack mock e-commerce web application. It is a **monorepo** with a React/TypeScript frontend and an ASP.NET Core 10 backend. The project is intentionally incomplete — the product catalogue is fully functional, but the shopping cart is a stub awaiting implementation.

## Architecture

```
mock-e-commerce-site/
├── src/
│   ├── frontend/     → React + TypeScript SPA (Vite)
│   └── backend/      → ASP.NET Core 10 Minimal API (C#)
└── test/
    ├── frontend/     → Vitest + Testing Library tests
    └── backend/      → xUnit integration & unit tests
```

## Detailed Instructions

For answers to specific questions about this codebase, consult the following instruction files — each is self-contained:

| Topic | File |
|---|---|
| Tech stack & versions | `.github/instructions/tech-stack.instructions.md` |
| File locations & structure | `.github/instructions/file-locations.instructions.md` |
| Implementation state | `.github/instructions/implementation-state.instructions.md` |
| Product data & models | `.github/instructions/product-data.instructions.md` |
| Running tests | `.github/instructions/test-commands.instructions.md` |

## Key Conventions

- **Frontend API calls** go through `src/frontend/src/api/index.ts`. Never call `fetch` directly from components.
- **Frontend types** are defined in `src/frontend/src/types/index.ts`. Do not duplicate types elsewhere.
- **Backend services** are registered in `src/backend/MockEcommerce.Api/Program.cs` as singletons.
- **Backend endpoints** use ASP.NET Core Minimal API syntax and are registered via extension methods in `src/backend/MockEcommerce.Api/Endpoints/`.
- **Frontend tests** live in `test/frontend/` mirroring the `src/frontend/src/` structure.
- **Backend tests** live in `test/backend/MockEcommerce.Api.Tests/` mirroring the `src/backend/MockEcommerce.Api/` structure.
- The Vite dev server proxies `/api/**` requests to the backend at `http://localhost:5063`.
- CORS is configured for `http://localhost:5173` (Vite default port).
