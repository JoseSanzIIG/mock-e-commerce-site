---
applyTo: "**"
---

# Test Commands

## Frontend Tests

### Run all frontend tests (from repository root)

```bash
npm test
```

or equivalently:

```bash
npm run test:frontend
```

Both commands execute `vitest run` using the root `vitest.config.ts`.

### Run with coverage (from `src/frontend/`)

```bash
cd src/frontend
npm run test:coverage
```

### Watch mode (from repository root)

```bash
npx vitest
```

### Configuration

| Setting | Value |
|---|---|
| Config file | `vitest.config.ts` (repository root) |
| Test pattern | `test/frontend/**/*.{test,spec}.{ts,tsx}` |
| Environment | `jsdom` |
| Setup file | `src/frontend/src/test-setup.ts` (loads `@testing-library/jest-dom`) |
| Globals | Enabled (`vi`, `describe`, `it`, `expect` — no imports needed) |

### Test files

| File | Tests | What it covers |
|---|---|---|
| `test/frontend/App.test.tsx` | 8 | `App` component — rendering, add-to-cart flow, notifications |
| `test/frontend/hooks/useProducts.test.ts` | 4 | `useProducts` hook — loading, success, error states |
| `test/frontend/components/Header/Header.test.tsx` | 6 | `Header` — logo, nav, cart badge |
| `test/frontend/components/HeroBanner/HeroBanner.test.tsx` | 4 | `HeroBanner` — heading, CTA |
| `test/frontend/components/ProductCard/ProductCard.test.tsx` | 7 | `ProductCard` — display, add-to-cart, out-of-stock |
| `test/frontend/components/ProductList/ProductList.test.tsx` | 3 | `ProductList` — list render, empty state |

---

## Backend Tests

### Run all backend tests

```bash
cd test/backend/MockEcommerce.Api.Tests
dotnet test
```

### Run with verbose output

```bash
dotnet test --verbosity detailed
```

### Run from solution root

```bash
cd src/backend
dotnet test
```

### Configuration

| Setting | Value |
|---|---|
| Test framework | xUnit 2.9.3 |
| Test SDK | Microsoft.NET.Test.Sdk 17.14.1 |
| Integration test helper | `Microsoft.AspNetCore.Mvc.Testing` (`WebApplicationFactory<Program>`) |
| Coverage collector | coverlet.collector 6.0.4 |
| Project file | `test/backend/MockEcommerce.Api.Tests/MockEcommerce.Api.Tests.csproj` |

### Test files

| File | Tests | What it covers |
|---|---|---|
| `test/backend/MockEcommerce.Api.Tests/Services/MockProductServiceTests.cs` | 4 | `MockProductService` — GetAll, GetById (valid/invalid), required fields |
| `test/backend/MockEcommerce.Api.Tests/Endpoints/ProductEndpointTests.cs` | 3 | `GET /api/products`, `GET /api/products/{id}` (found/not found) via HTTP |

> **Note**: No tests exist yet for cart endpoints or `InMemoryCartService`. They should be added once cart functionality is implemented.
