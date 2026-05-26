# Cart Feature — Specification

## Overview

Users can view, update, and manage their shopping cart before checkout. The cart is accessible from the existing cart icon in the header. Each product has a maximum purchasable quantity of **5 units**.

---

## Resolved Ambiguities

| # | Topic | Decision |
|---|---|---|
| 1 | **Max-qty on PUT** | `quantity` is the new absolute quantity. Must be between 1 and 5 inclusive. A PUT with `quantity: 6` returns `400`. A PUT with `quantity: 0` returns `400` — use DELETE to remove an item. |
| 2 | **Increment semantics on POST** | POST adds to any existing quantity. If the item is already in the cart, the service checks `existing.Quantity + request.Quantity`. If the result exceeds 5, the request is rejected with `400`. |
| 3 | **PUT on a missing cart item** | `PUT /api/cart/{productId}` returns `404` if the product is not currently in the cart. PUT never creates a new cart item — that is the responsibility of POST. |
| 4 | **Error response format** | All errors return a JSON body `{ "error": "<human-readable message>" }` with the appropriate HTTP status code. No `ValidationProblem` (no RFC 7807) — plain JSON only. |
| 5 | **UI approach** | The cart renders as a slide-in drawer from the right, layered over the page. It is opened by clicking the cart icon in the `Header`. No separate route or page is introduced. |
| 6 | **Out-of-stock enforcement on POST** | If the product exists but `stock === 0`, POST returns `400` with `{ "error": "Product is out of stock." }`. |
| 7 | **GET /api/cart response shape** | Returns a wrapper object `{ "items": [...], "cartTotal": <decimal> }` so the frontend does not need to re-compute the total. An empty cart returns `{ "items": [], "cartTotal": 0.00 }`. |
| 8 | **Cart scope** | Single shared in-memory cart (singleton, no authentication). Cleared on server restart. |

---

## API Specification

### `GET /api/cart`

Returns all items currently in the cart plus a computed total.

**Response `200 OK`**
```json
{
  "items": [
    {
      "productId": 1,
      "productName": "Wireless Headphones",
      "unitPrice": 79.99,
      "quantity": 2,
      "totalPrice": 159.98
    }
  ],
  "cartTotal": 159.98
}
```

Empty cart:
```json
{ "items": [], "cartTotal": 0.00 }
```

---

### `POST /api/cart`

Adds a product to the cart. If the product is already in the cart the quantity is incremented.

**Request body**
```json
{ "productId": 1, "quantity": 2 }
```

**Validation (checked in order)**

| Rule | Status | Error message |
|---|---|---|
| `quantity` < 1 | `400` | `"Quantity must be at least 1."` |
| `productId` not in product catalogue | `404` | `"Product not found."` |
| Product `stock === 0` | `400` | `"Product is out of stock."` |
| `existingQuantity + quantity > 5` | `400` | `"Cannot exceed the maximum quantity of 5 for this item. Current quantity in cart: {n}."` |

**Success responses**

| Scenario | Status | Body |
|---|---|---|
| Item added for the first time | `201 Created` | The created `CartItem` |
| Item already existed (quantity incremented) | `200 OK` | The updated `CartItem` |

---

### `PUT /api/cart/{productId}`

Sets the quantity of an item already in the cart to an absolute value.

**Route parameter**: `productId` — integer, the product to update.

**Request body**
```json
{ "quantity": 3 }
```

**Validation (checked in order)**

| Rule | Status | Error message |
|---|---|---|
| `quantity` < 1 | `400` | `"Quantity must be at least 1. Use DELETE to remove an item."` |
| `quantity` > 5 | `400` | `"Cannot exceed the maximum quantity of 5 for this item."` |
| `productId` not found in cart | `404` | `"Item not found in cart."` |

**Success response `200 OK`** — the updated `CartItem`.

---

### `DELETE /api/cart/{productId}`

Removes a single item from the cart.

**Validation**

| Rule | Status | Error message |
|---|---|---|
| `productId` not found in cart | `404` | `"Item not found in cart."` |

**Success response `204 No Content`**

---

### `DELETE /api/cart`

Clears the entire cart. Always succeeds, even if the cart is already empty (idempotent).

**Success response `204 No Content`**

---

## Data Models

### Backend — `CartItem` (existing, no changes)

| Property | Type | Notes |
|---|---|---|
| `ProductId` | `int` | FK to `Product.Id` |
| `ProductName` | `string` | Snapshot at time of add |
| `UnitPrice` | `decimal` | Price at time of add |
| `Quantity` | `int` | 1–5 inclusive |
| `TotalPrice` | `decimal` | Computed: `UnitPrice * Quantity` |

### Backend — `UpdateCartRequest` (new record)

```csharp
public record UpdateCartRequest(int Quantity);
```

### Backend — `CartSummary` (new record, GET response wrapper)

```csharp
public record CartSummary(IEnumerable<CartItem> Items, decimal CartTotal);
```

### Frontend — `CartItem` interface (new, in `types/index.ts`)

| Field | Type |
|---|---|
| `productId` | `number` |
| `productName` | `string` |
| `unitPrice` | `number` |
| `quantity` | `number` |
| `totalPrice` | `number` |

### Frontend — `CartSummary` interface (new, in `types/index.ts`)

| Field | Type |
|---|---|
| `items` | `CartItem[]` |
| `cartTotal` | `number` |

---

## Service Interface Changes

Add one method to `ICartService`:

```csharp
/// <summary>
/// Updates the quantity of an existing cart item.
/// </summary>
/// <param name="productId">The product whose quantity to update.</param>
/// <param name="quantity">The new absolute quantity (1–5).</param>
/// <returns>The updated CartItem, or null if not found.</returns>
CartItem? Update(int productId, int quantity);
```

---

## Frontend Behaviour

### Cart Drawer

- **Trigger**: Clicking the cart icon button in `Header` dispatches `onCartOpen()`.
- **State**: `isCartOpen: boolean` owned by `App.tsx`. Passed down to `Header` as `onCartOpen` and to `CartDrawer` as `isOpen`.
- **Fetch on open**: When `isCartOpen` transitions from `false` to `true`, the drawer fetches `GET /api/cart`.
- **Empty state**: Displays "Your cart is empty." with a call-to-action to continue shopping.
- **Item row**: Product name, unit price, quantity control (`−` button / numeric display / `+` button), line total, remove (`×`) button.
  - `−` button disabled when `quantity === 1`.
  - `+` button disabled when `quantity === 5`.
  - Clicking `−` with `quantity === 1` shows a confirmation before calling DELETE (or can directly DELETE — **decision**: directly DELETE without confirmation).
  - Clicking `+` calls `PUT /api/cart/{productId}` with `quantity + 1`.
  - Clicking `−` calls `PUT /api/cart/{productId}` with `quantity - 1`, unless `quantity === 1` in which case it calls `DELETE /api/cart/{productId}`.
- **Cart total**: Displayed at the bottom of the drawer.
- **Close**: An `×` button in the drawer header closes the drawer (sets `isCartOpen` to `false`).
- **Overlay**: A semi-transparent backdrop behind the drawer; clicking it also closes the drawer.

### Header changes

`Header` receives a new prop: `onCartOpen: () => void`. The existing cart button calls `onCartOpen()` on click.

---

## Edge Cases

| Scenario | Expected behaviour |
|---|---|
| POST with `quantity: 0` | `400` — `"Quantity must be at least 1."` |
| POST with `quantity: 5` and item already has `quantity: 1` | `200 OK`, item quantity becomes 6? No — `1 + 5 = 6 > 5` → `400` |
| POST with `quantity: 4` and item already has `quantity: 1` | `200 OK`, quantity becomes 5 |
| PUT with `quantity: 0` | `400` — `"Quantity must be at least 1. Use DELETE to remove an item."` |
| PUT with `quantity: 5` | `200 OK`, sets quantity to 5 |
| PUT with `quantity: 6` | `400` — `"Cannot exceed the maximum quantity of 5 for this item."` |
| PUT on product not in cart | `404` — `"Item not found in cart."` |
| DELETE on product not in cart | `404` — `"Item not found in cart."` |
| DELETE (clear) on empty cart | `204 No Content` — idempotent |
| GET on empty cart | `200 OK` — `{ "items": [], "cartTotal": 0.00 }` |
| POST with non-existent `productId` | `404` — `"Product not found."` |
| POST for out-of-stock product | `400` — `"Product is out of stock."` |
| `+` button in drawer when quantity is 5 | Button is disabled; no request sent |
| `−` button in drawer when quantity is 1 | Calls DELETE; item is removed from cart |
