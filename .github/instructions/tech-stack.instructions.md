---
applyTo: "**"
---

# Tech Stack

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI component framework |
| React DOM | 19.2.4 | DOM rendering |
| TypeScript | ~6.0.2 | Static typing |
| Vite | 8.0.4 | Build tool & dev server |
| @vitejs/plugin-react | 6.0.1 | React fast-refresh for Vite |
| Vitest | 4.1.4 | Unit / component test runner |
| @testing-library/react | 16.3.2 | Component rendering helpers |
| @testing-library/jest-dom | 6.9.1 | DOM assertion matchers |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| @vitest/coverage-v8 | 4.1.4 | Code coverage |
| jsdom | 29.0.2 | Browser DOM simulation for tests |
| ESLint | 9.39.4 | Linting |
| typescript-eslint | 8.58.0 | TypeScript ESLint rules |
| eslint-plugin-react-hooks | 7.0.1 | React hooks lint rules |
| eslint-plugin-react-refresh | 0.5.2 | Fast-refresh lint rules |

**TypeScript config**: `ES2023` target, `bundler` module resolution, strict null checks, `noUnusedLocals`, `noUnusedParameters` enabled.

**JSX transform**: `react-jsx` (no need to import React in every file).

## Backend

| Technology | Version | Purpose |
|---|---|---|
| .NET / ASP.NET Core | 10.0 (net10.0) | Web API runtime & framework |
| C# | Latest (implicit usings, nullable enabled) | Language |
| Microsoft.AspNetCore.OpenApi | 10.0.5 | OpenAPI / Swagger support |
| xUnit | 2.9.3 | Unit & integration test framework |
| xunit.runner.visualstudio | 3.1.4 | VS Test Explorer integration |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.* | `WebApplicationFactory` for integration tests |
| Microsoft.NET.Test.Sdk | 17.14.1 | .NET test SDK |
| coverlet.collector | 6.0.4 | Code coverage collection |

**Backend style**: Minimal API (no controllers), dependency injection via `builder.Services`, nullable reference types enabled, implicit usings enabled.

## Ports (Development)

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend HTTP | http://localhost:5063 |
| Backend HTTPS | https://localhost:7296 |

The Vite dev server proxies all `/api/**` requests to `http://localhost:5063`.
