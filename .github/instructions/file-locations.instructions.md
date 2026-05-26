---
applyTo: "**"
---

# File Locations & Structure

## Root

| Path | Purpose |
|---|---|
| `package.json` | Root workspace config; defines `test` and `test:frontend` scripts |
| `tsconfig.json` | Root TypeScript config (includes `test/frontend/**`) |
| `vitest.config.ts` | Vitest runner config (jsdom env, test pattern `test/frontend/**`) |
| `src/frontend/` | React + TypeScript SPA |
| `src/backend/` | ASP.NET Core 10 Minimal API |
| `test/frontend/` | Frontend Vitest tests |
| `test/backend/` | Backend xUnit tests |

## Backend — `src/backend/MockEcommerce.Api/`

| Path | Purpose |
|---|---|
| `Program.cs` | App entry point: DI registration, CORS, middleware, endpoint mapping |
| `MockEcommerce.Api.csproj` | Project file with NuGet dependencies |
| `appsettings.json` | Logging configuration |
| `appsettings.Development.json` | Development overrides |
| `Properties/launchSettings.json` | Launch profiles (ports 5063 / 7296) |
| `Models/Product.cs` | `Product` entity (7 properties) |
| `Models/CartItem.cs` | `CartItem` entity (5 properties, computed `TotalPrice`) |
| `Services/IProductService.cs` | Interface: `GetAll()`, `GetById(id)` |
| `Services/MockProductService.cs` | Concrete implementation with 5 hardcoded products |
| `Services/ICartService.cs` | Interface: `GetAll()`, `Add()`, `GetByProductId()`, `Remove()`, `Clear()` |
| `Services/InMemoryCartService.cs` | Skeleton — all methods throw `NotImplementedException` |
| `Endpoints/ProductEndpoints.cs` | `GET /api/products` and `GET /api/products/{id}` — fully implemented |
| `Endpoints/CartEndpoints.cs` | `GET/POST/DELETE /api/cart` — skeleton stubs |

## Frontend — `src/frontend/src/`

| Path | Purpose |
|---|---|
| `main.tsx` | React entry point — mounts `<App />` in `StrictMode` |
| `App.tsx` | Root component — orchestrates layout, cart state, notifications |
| `App.css` | Styles for header, hero, product-list, notifications |
| `index.css` | Global styles — CSS variables, dark mode, design tokens |
| `test-setup.ts` | Imports `@testing-library/jest-dom` matchers for all tests |
| `types/index.ts` | Shared TypeScript types: `Product`, `AddToCartRequest` |
| `api/index.ts` | All HTTP calls: `fetchProducts()`, `fetchProductById()`, `addToCart()` |
| `hooks/useProducts.ts` | Custom hook — fetches products on mount, returns `{ products, loading, error }` |
| `components/Header/Header.tsx` | Sticky navigation with logo, links, cart count badge |
| `components/Header/index.ts` | Barrel export |
| `components/HeroBanner/HeroBanner.tsx` | Promotional hero section with CTA link |
| `components/HeroBanner/index.ts` | Barrel export |
| `components/ProductCard/ProductCard.tsx` | Single product card with add-to-cart / out-of-stock button |
| `components/ProductCard/index.ts` | Barrel export |
| `components/ProductList/ProductList.tsx` | Maps products array to `ProductCard` components; shows empty state |
| `components/ProductList/index.ts` | Barrel export |

## Frontend Tests — `test/frontend/`

Tests mirror the `src/frontend/src/` directory structure.

| Path | What it tests |
|---|---|
| `test/frontend/App.test.tsx` | `App` component (8 tests) |
| `test/frontend/hooks/useProducts.test.ts` | `useProducts` hook (4 tests) |
| `test/frontend/components/Header/Header.test.tsx` | `Header` component (6 tests) |
| `test/frontend/components/HeroBanner/HeroBanner.test.tsx` | `HeroBanner` component (4 tests) |
| `test/frontend/components/ProductCard/ProductCard.test.tsx` | `ProductCard` component (7 tests) |
| `test/frontend/components/ProductList/ProductList.test.tsx` | `ProductList` component (3 tests) |

## Backend Tests — `test/backend/MockEcommerce.Api.Tests/`

| Path | What it tests |
|---|---|
| `MockEcommerce.Api.Tests.csproj` | xUnit project file |
| `Services/MockProductServiceTests.cs` | `MockProductService` (4 tests) |
| `Endpoints/ProductEndpointTests.cs` | Product HTTP endpoints via `WebApplicationFactory` (3 tests) |
