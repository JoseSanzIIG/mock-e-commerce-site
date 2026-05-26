# Cart Feature — Implementation Plan

> Follow steps in order. Each step builds on the previous. Run tests at the end of each phase before moving to the next.

---

## Phase 1 — Backend Models

### Step 1 — Add `UpdateCartRequest` record and `CartSummary` record

**File**: `src/backend/MockEcommerce.Api/Models/CartItem.cs`

Append two new records to the file (after the existing `AddToCartRequest` record):

```csharp
/// <summary>Request body for PUT /api/cart/{productId}.</summary>
public record UpdateCartRequest(int Quantity);

/// <summary>Response wrapper for GET /api/cart.</summary>
public record CartSummary(IEnumerable<CartItem> Items, decimal CartTotal);
```

---

## Phase 2 — Backend Service Layer

### Step 2 — Add `Update` to `ICartService`

**File**: `src/backend/MockEcommerce.Api/Services/ICartService.cs`

Add one method signature inside the interface:

```csharp
/// <summary>
/// Sets the quantity of an existing cart item to an absolute value.
/// </summary>
/// <param name="productId">The product to update.</param>
/// <param name="quantity">The new absolute quantity.</param>
/// <returns>The updated CartItem, or null if not found.</returns>
CartItem? Update(int productId, int quantity);
```

### Step 3 — Implement all methods in `InMemoryCartService`

**File**: `src/backend/MockEcommerce.Api/Services/InMemoryCartService.cs`

Replace every `throw new NotImplementedException()` body. All methods must acquire `_lock` before touching `_cart`.

| Method | Logic |
|---|---|
| `GetAll()` | `lock (_lock) return _cart.ToList();` |
| `GetByProductId(productId)` | `lock (_lock) return _cart.FirstOrDefault(i => i.ProductId == productId);` |
| `Add(CartItem item)` | Acquire lock. Find existing item by `ProductId`. If found, increment `Quantity` by `item.Quantity` and return it. If not found, add `item` to `_cart` and return it. |
| `Update(productId, quantity)` | Acquire lock. Find existing item. If not found return `null`. Otherwise set `item.Quantity = quantity` and return item. |
| `Remove(productId)` | Acquire lock. Find item. If not found return `false`. Remove from list, return `true`. |
| `Clear()` | Acquire lock. Call `_cart.Clear()`. |

---

## Phase 3 — Backend Endpoints

### Step 4 — Register the `PUT` route in `CartEndpoints.MapCartEndpoints`

**File**: `src/backend/MockEcommerce.Api/Endpoints/CartEndpoints.cs`

Add inside `MapCartEndpoints`, after the existing `MapPost`:

```csharp
group.MapPut("/{productId:int}", UpdateCartItem)
    .WithName("UpdateCartItem")
    .WithSummary("Sets the quantity of an existing cart item.");
```

### Step 5 — Implement all endpoint handlers

**File**: `src/backend/MockEcommerce.Api/Endpoints/CartEndpoints.cs`

#### `GetCart`

Return type: `Ok<CartSummary>`

```csharp
internal static Ok<CartSummary> GetCart(ICartService cartService)
{
    var items = cartService.GetAll();
    var total = items.Sum(i => i.TotalPrice);
    return TypedResults.Ok(new CartSummary(items, total));
}
```

#### `AddToCart`

Return type: `Results<Created<CartItem>, Ok<CartItem>, NotFound<object>, BadRequest<object>>`

Validation order:
1. `request.Quantity < 1` → `400` `{ "error": "Quantity must be at least 1." }`
2. `productService.GetById(request.ProductId)` is `null` → `404` `{ "error": "Product not found." }`
3. `product.Stock == 0` → `400` `{ "error": "Product is out of stock." }`
4. Fetch existing item via `cartService.GetByProductId`. If `existing != null && existing.Quantity + request.Quantity > 5` → `400` `{ "error": "Cannot exceed the maximum quantity of 5 for this item. Current quantity in cart: {existing.Quantity}." }`
5. Build `CartItem` with `ProductName`, `UnitPrice` from product, `Quantity = request.Quantity`.
6. Call `cartService.Add(item)`.
7. If a new item was created (no pre-existing item) → `201 Created`. If quantity was incremented → `200 OK`.

#### `UpdateCartItem` (new handler)

Return type: `Results<Ok<CartItem>, NotFound<object>, BadRequest<object>>`

Parameters: `int productId`, `UpdateCartRequest request`, `ICartService cartService`

Validation order:
1. `request.Quantity < 1` → `400` `{ "error": "Quantity must be at least 1. Use DELETE to remove an item." }`
2. `request.Quantity > 5` → `400` `{ "error": "Cannot exceed the maximum quantity of 5 for this item." }`
3. `cartService.Update(productId, request.Quantity)` returns `null` → `404` `{ "error": "Item not found in cart." }`
4. Return `200 OK` with updated item.

#### `RemoveFromCart`

Return type: `Results<NoContent, NotFound<object>>`

1. `cartService.Remove(productId)` returns `false` → `404` `{ "error": "Item not found in cart." }`
2. Return `204 No Content`.

#### `ClearCart`

Return type: `NoContent`

1. `cartService.Clear()`.
2. Return `204 No Content`.

---

## Phase 4 — Frontend Types

### Step 6 — Add `CartItem` and `CartSummary` types

**File**: `src/frontend/src/types/index.ts`

Append:

```typescript
export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  cartTotal: number;
}
```

---

## Phase 5 — Frontend API Layer

### Step 7 — Add cart API functions

**File**: `src/frontend/src/api/index.ts`

Add four functions:

```typescript
export async function fetchCart(): Promise<CartSummary> { ... }   // GET /api/cart
export async function updateCartItem(productId: number, quantity: number): Promise<CartItem> { ... }  // PUT /api/cart/{productId}
export async function removeCartItem(productId: number): Promise<void> { ... }  // DELETE /api/cart/{productId}
export async function clearCart(): Promise<void> { ... }  // DELETE /api/cart
```

Import `CartItem` and `CartSummary` from `../types`.

---

## Phase 6 — Frontend Components

### Step 8 — Create `CartDrawer` component

**File**: `src/frontend/src/components/CartDrawer/CartDrawer.tsx`  
**File**: `src/frontend/src/components/CartDrawer/index.ts` (barrel export)

Props:
```typescript
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
```

Behaviour:
- On `isOpen` changing from `false` to `true`, call `fetchCart()` and store result in local state `cartSummary: CartSummary | null`.
- Renders a `<div role="dialog" aria-modal="true" aria-label="Shopping cart">` overlay.
- A semi-transparent backdrop `<div>` — clicking it calls `onClose()`.
- Empty state: paragraph "Your cart is empty." when `cartSummary.items.length === 0`.
- Per item row:
  - Product name and unit price
  - `−` button (calls `removeCartItem` if `quantity === 1`, else `PUT` with `quantity - 1`; disabled when an async call is in-flight)
  - Quantity display
  - `+` button (calls `PUT` with `quantity + 1`; disabled when `quantity === 5`)
  - Line total (`$xx.xx`)
  - `×` remove button (calls `removeCartItem`)
- Cart total displayed below the list.
- `×` close button in drawer header calls `onClose()`.

### Step 9 — Update `Header` to accept `onCartOpen`

**File**: `src/frontend/src/components/Header/Header.tsx`

Add `onCartOpen: () => void` to `HeaderProps`. Wire it to the cart button's `onClick`:

```tsx
<button
  className="header__cart-button"
  aria-label={`Shopping cart with ${cartItemCount} items`}
  onClick={onCartOpen}
>
```

### Step 10 — Wire `CartDrawer` and updated `Header` in `App.tsx`

**File**: `src/frontend/src/App.tsx`

1. Add state: `const [isCartOpen, setIsCartOpen] = useState(false);`
2. Pass `onCartOpen={() => setIsCartOpen(true)}` to `<Header>`.
3. Render `<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />` below the main layout.
4. `cartItemCount` passed to `Header` should reflect the live total item count. Derive it from the cart state inside `CartDrawer` — or hold `cartItemCount` in `App` and let `CartDrawer` call a callback `onCartChange(count: number)` after every mutation.

---

## Phase 7 — Tests

### Step 11 — Backend unit tests for `InMemoryCartService`

**File**: `test/backend/MockEcommerce.Api.Tests/Services/InMemoryCartServiceTests.cs`

| Test name | What it verifies |
|---|---|
| `GetAll_OnEmptyCart_ReturnsEmptyList` | Returns empty enumerable |
| `Add_NewItem_ReturnsAddedItem` | Item is in list after Add |
| `Add_ExistingItem_IncrementsQuantity` | Quantity accumulates correctly |
| `GetByProductId_ExistingItem_ReturnsItem` | Correct item returned |
| `GetByProductId_MissingItem_ReturnsNull` | Returns null |
| `Update_ExistingItem_SetsAbsoluteQuantity` | Quantity is replaced, not incremented |
| `Update_MissingItem_ReturnsNull` | Returns null |
| `Remove_ExistingItem_ReturnsTrueAndRemovesItem` | True + item gone |
| `Remove_MissingItem_ReturnsFalse` | Returns false |
| `Clear_RemovesAllItems` | List empty after Clear |

### Step 12 — Backend integration tests for cart endpoints

**File**: `test/backend/MockEcommerce.Api.Tests/Endpoints/CartEndpointTests.cs`

Use `WebApplicationFactory<Program>`.

| Test name | What it verifies |
|---|---|
| `GetCart_OnEmptyCart_ReturnsOkWithEmptyItems` | 200, `items: []`, `cartTotal: 0` |
| `AddToCart_ValidRequest_Returns201WithCartItem` | 201, correct item body |
| `AddToCart_DuplicateItem_Returns200AndIncrementsQuantity` | 200, quantity summed |
| `AddToCart_QuantityZero_Returns400` | 400, correct error message |
| `AddToCart_InvalidProductId_Returns404` | 404 |
| `AddToCart_WouldExceedMaxQuantity_Returns400` | 400, correct error message |
| `UpdateCartItem_ValidRequest_Returns200WithUpdatedItem` | 200, correct quantity |
| `UpdateCartItem_QuantityZero_Returns400` | 400 |
| `UpdateCartItem_QuantityAboveMax_Returns400` | 400 |
| `UpdateCartItem_ItemNotInCart_Returns404` | 404 |
| `RemoveFromCart_ExistingItem_Returns204` | 204 |
| `RemoveFromCart_MissingItem_Returns404` | 404 |
| `ClearCart_Returns204` | 204 |
| `ClearCart_OnEmptyCart_Returns204` | 204 (idempotent) |

### Step 13 — Frontend component tests for `CartDrawer`

**File**: `test/frontend/components/CartDrawer/CartDrawer.test.tsx`

Mock `src/frontend/src/api/index.ts` with `vi.mock`.

| Test name | What it verifies |
|---|---|
| `renders nothing when isOpen is false` | Drawer not in DOM |
| `renders drawer when isOpen is true` | Dialog element present |
| `shows empty state when cart has no items` | "Your cart is empty." visible |
| `renders cart items with correct details` | Name, price, quantity, total displayed |
| `shows cart total` | Total rendered correctly |
| `plus button calls updateCartItem with incremented quantity` | API called with quantity + 1 |
| `minus button on quantity 1 calls removeCartItem` | DELETE called |
| `minus button on quantity above 1 calls updateCartItem with decremented quantity` | PUT called with quantity - 1 |
| `plus button is disabled when quantity is 5` | Button has disabled attribute |
| `minus button is disabled when quantity is 1` | Button has disabled attribute |
| `remove button calls removeCartItem` | API called for correct productId |
| `close button calls onClose` | onClose callback fired |
| `clicking backdrop calls onClose` | onClose callback fired |

### Step 14 — Update `Header` tests

**File**: `test/frontend/components/Header/Header.test.tsx`

Add tests:
- `onCartOpen is called when cart button is clicked`
- Update any existing `Header` snapshot/render tests to pass the new required `onCartOpen` prop.

---

## Completion Checklist

- [ ] `UpdateCartRequest` and `CartSummary` records added to `CartItem.cs`
- [ ] `ICartService.Update` method declared
- [ ] All 6 `InMemoryCartService` methods implemented (no `NotImplementedException` remaining)
- [ ] `PUT /{productId}` route registered in `CartEndpoints`
- [ ] All 5 endpoint handlers implemented with correct validation and error bodies
- [ ] `CartItem` and `CartSummary` types added to `types/index.ts`
- [ ] `fetchCart`, `updateCartItem`, `removeCartItem`, `clearCart` added to `api/index.ts`
- [ ] `CartDrawer` component created with correct props and behaviour
- [ ] `Header` updated with `onCartOpen` prop
- [ ] `App.tsx` wires `isCartOpen`, passes `onCartOpen` to Header, renders `CartDrawer`
- [ ] `InMemoryCartServiceTests` — all 10 tests passing
- [ ] `CartEndpointTests` — all 14 tests passing
- [ ] `CartDrawer.test.tsx` — all 13 tests passing
- [ ] `Header.test.tsx` — updated and passing
- [ ] `npm test` — all frontend tests green
- [ ] `dotnet test` — all backend tests green
