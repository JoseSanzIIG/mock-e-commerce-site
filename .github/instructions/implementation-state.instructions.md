---
applyTo: "**"
---

# Implementation State

## Fully Implemented ✅

### Backend — Products

| Feature | File | Notes |
|---|---|---|
| `GET /api/products` | `Endpoints/ProductEndpoints.cs` | Returns all 5 products |
| `GET /api/products/{id}` | `Endpoints/ProductEndpoints.cs` | Returns product or 404 |
| `IProductService.GetAll()` | `Services/MockProductService.cs` | Returns hardcoded list |
| `IProductService.GetById(id)` | `Services/MockProductService.cs` | Returns product or null |

### Frontend

| Feature | File | Notes |
|---|---|---|
| `useProducts()` hook | `hooks/useProducts.ts` | Loads products on mount; manages loading/error state |
| `fetchProducts()` | `api/index.ts` | GET /api/products |
| `fetchProductById()` | `api/index.ts` | GET /api/products/{id} |
| `addToCart()` | `api/index.ts` | POST /api/cart (frontend call works; backend is a stub) |
| `Header` component | `components/Header/Header.tsx` | Logo, nav links, cart count badge |
| `HeroBanner` component | `components/HeroBanner/HeroBanner.tsx` | Promotional section with CTA |
| `ProductCard` component | `components/ProductCard/ProductCard.tsx` | Product display; disables add-to-cart when `stock === 0` |
| `ProductList` component | `components/ProductList/ProductList.tsx` | Renders product grid; shows empty state |
| `App` component | `App.tsx` | Cart state, notifications (3 s auto-hide), loading/error states |

### Tests

| Suite | Count | Status |
|---|---|---|
| Backend — `MockProductServiceTests` | 4 | ✅ Passing |
| Backend — `ProductEndpointTests` | 3 | ✅ Passing |
| Frontend — `App.test.tsx` | 8 | ✅ Passing |
| Frontend — `Header.test.tsx` | 6 | ✅ Passing |
| Frontend — `HeroBanner.test.tsx` | 4 | ✅ Passing |
| Frontend — `ProductCard.test.tsx` | 7 | ✅ Passing |
| Frontend — `ProductList.test.tsx` | 3 | ✅ Passing |
| Frontend — `useProducts.test.ts` | 4 | ✅ Passing |

---

## Not Yet Implemented ❌

### Backend — Cart Service (`Services/InMemoryCartService.cs`)

`InMemoryCartService` has a thread-safe `_lock` object and a `_cart` list initialised, but every method body throws `NotImplementedException`:

| Method | Status |
|---|---|
| `GetAll()` | ❌ Throws `NotImplementedException` |
| `Add(CartItem item)` | ❌ Throws `NotImplementedException` |
| `GetByProductId(int productId)` | ❌ Throws `NotImplementedException` |
| `Remove(int productId)` | ❌ Throws `NotImplementedException` |
| `Clear()` | ❌ Throws `NotImplementedException` |

### Backend — Cart Endpoints (`Endpoints/CartEndpoints.cs`)

All cart endpoints exist in the routing table but delegate to the unimplemented service:

| Method | Path | Status |
|---|---|---|
| GET | `/api/cart` | ❌ Not functional |
| POST | `/api/cart` | ❌ Not functional |
| DELETE | `/api/cart/{productId}` | ❌ Not functional |
| DELETE | `/api/cart` | ❌ Not functional |

### Frontend — Cart UI

| Feature | Status |
|---|---|
| Cart view / drawer | ❌ Not built |
| Checkout flow | ❌ Not built |
| Cart persistence across page reload | ❌ Not built |
| Cart item list display | ❌ Not built |

> **Note**: The `Header` component already accepts a `cartItemCount: number` prop and displays a badge — wiring it to real cart data is part of the remaining work.

### Tests — Cart

No tests exist for cart endpoints or `InMemoryCartService`. These should be added once the implementations are complete.
