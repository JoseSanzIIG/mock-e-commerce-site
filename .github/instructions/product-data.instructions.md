---
applyTo: "**"
---

# Product Data & Models

## Product Catalogue

All product data is hardcoded in `src/backend/MockEcommerce.Api/Services/MockProductService.cs`. There are exactly **5 products**:

| ID | Name | Category | Price (USD) | Stock | Description |
|---|---|---|---|---|---|
| 1 | Wireless Headphones | Electronics | $79.99 | 25 | Over-ear noise-cancelling wireless headphones with 30-hour battery life. |
| 2 | Running Shoes | Footwear | $59.99 | 40 | Lightweight breathable running shoes for all-terrain use. |
| 3 | Stainless Steel Water Bottle | Accessories | $24.99 | 100 | Insulated 32 oz water bottle that keeps drinks cold for 24 hours. |
| 4 | Mechanical Keyboard | Electronics | $109.99 | 15 | Compact tenkeyless mechanical keyboard with Cherry MX Blue switches. |
| 5 | Yoga Mat | Sports | $34.99 | 60 | Non-slip 6mm thick yoga mat with carrying strap. |

Image URLs follow the pattern `https://placehold.co/300x300?text=<Label>` (e.g. `https://placehold.co/300x300?text=Headphones`).

All products have `stock > 0` (none are out of stock in the default data set).

---

## Backend Models

### `Product` (`Models/Product.cs`)

| Property | Type | Notes |
|---|---|---|
| `Id` | `int` | Unique identifier (1–5 in mock data) |
| `Name` | `string` | Product display name |
| `Description` | `string` | Short product description |
| `Price` | `decimal` | Unit price in USD |
| `Category` | `string` | One of: `Electronics`, `Footwear`, `Accessories`, `Sports` |
| `Stock` | `int` | Available quantity; `0` means out of stock |
| `ImageUrl` | `string` | Absolute URL to product image |

### `CartItem` (`Models/CartItem.cs`)

| Property | Type | Notes |
|---|---|---|
| `ProductId` | `int` | Foreign key to `Product.Id` |
| `ProductName` | `string` | Denormalised product name |
| `UnitPrice` | `decimal` | Price at time of adding to cart |
| `Quantity` | `int` | Number of units |
| `TotalPrice` | `decimal` | **Computed** — `UnitPrice * Quantity` (no setter) |

### `AddToCartRequest` (`Models/CartItem.cs` — record)

| Property | Type |
|---|---|
| `ProductId` | `int` |
| `Quantity` | `int` |

---

## Frontend Types (`src/frontend/src/types/index.ts`)

### `Product` interface

Mirrors the backend model:

| Field | Type |
|---|---|
| `id` | `number` |
| `name` | `string` |
| `description` | `string` |
| `price` | `number` |
| `category` | `string` |
| `stock` | `number` |
| `imageUrl` | `string` |

### `AddToCartRequest` interface

| Field | Type |
|---|---|
| `productId` | `number` |
| `quantity` | `number` |
