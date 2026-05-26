using Microsoft.AspNetCore.Http.HttpResults;
using MockEcommerce.Api.Models;
using MockEcommerce.Api.Services;

namespace MockEcommerce.Api.Endpoints;

/// <summary>
/// Maps shopping cart endpoints under <c>/api/cart</c>.
/// </summary>
public static class CartEndpoints
{
    /// <summary>Registers cart-related routes on the given endpoint route builder.</summary>
    public static void MapCartEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("api/cart")
            .WithTags("Cart");

        group.MapGet("/", GetCart)
            .WithName("GetCart")
            .WithSummary("Returns all items currently in the cart.");

        group.MapPost("/", AddToCart)
            .WithName("AddToCart")
            .WithSummary("Adds a product to the cart or increments quantity if already present.");

        group.MapPut("/{productId:int}", UpdateCartItem)
            .WithName("UpdateCartItem")
            .WithSummary("Sets the quantity of an existing cart item.");

        group.MapDelete("/{productId:int}", RemoveFromCart)
            .WithName("RemoveFromCart")
            .WithSummary("Removes a single product from the cart by its product ID.");

        group.MapDelete("/", ClearCart)
            .WithName("ClearCart")
            .WithSummary("Removes all items from the cart.");
    }

    /// <summary>Returns all items currently in the cart.</summary>
    internal static Ok<CartSummary> GetCart(ICartService cartService)
    {
        var items = cartService.GetAll().ToList();
        var total = items.Sum(i => i.TotalPrice);
        return TypedResults.Ok(new CartSummary(items, total));
    }

    /// <summary>Adds a product to the cart or increments quantity if already present.</summary>
    internal static Results<Created<CartItem>, Ok<CartItem>, NotFound<CartError>, BadRequest<CartError>> AddToCart(
        AddToCartRequest request,
        IProductService productService,
        ICartService cartService)
    {
        if (request.Quantity < 1)
            return TypedResults.BadRequest(new CartError("Quantity must be at least 1."));

        var product = productService.GetById(request.ProductId);
        if (product is null)
            return TypedResults.NotFound(new CartError("Product not found."));

        if (product.Stock == 0)
            return TypedResults.BadRequest(new CartError("Product is out of stock."));

        var existing = cartService.GetByProductId(request.ProductId);
        if (existing != null && existing.Quantity + request.Quantity > 5)
            return TypedResults.BadRequest(new CartError(
                $"Cannot exceed the maximum quantity of 5 for this item. Current quantity in cart: {existing.Quantity}."));

        var isNew = existing is null;
        var cartItem = new CartItem
        {
            ProductId = product.Id,
            ProductName = product.Name,
            UnitPrice = product.Price,
            Quantity = request.Quantity,
        };

        var result = cartService.Add(cartItem);
        return isNew
            ? TypedResults.Created($"/api/cart/{result.ProductId}", result)
            : TypedResults.Ok(result);
    }

    /// <summary>Sets the quantity of an existing cart item.</summary>
    internal static Results<Ok<CartItem>, NotFound<CartError>, BadRequest<CartError>> UpdateCartItem(
        int productId,
        UpdateCartRequest request,
        ICartService cartService)
    {
        if (request.Quantity < 1)
            return TypedResults.BadRequest(new CartError("Quantity must be at least 1. Use DELETE to remove an item."));

        if (request.Quantity > 5)
            return TypedResults.BadRequest(new CartError("Cannot exceed the maximum quantity of 5 for this item."));

        var updated = cartService.Update(productId, request.Quantity);
        if (updated is null)
            return TypedResults.NotFound(new CartError("Item not found in cart."));

        return TypedResults.Ok(updated);
    }

    /// <summary>Removes a single product from the cart by its product ID.</summary>
    internal static Results<NoContent, NotFound<CartError>> RemoveFromCart(int productId, ICartService cartService)
    {
        var removed = cartService.Remove(productId);
        if (!removed)
            return TypedResults.NotFound(new CartError("Item not found in cart."));

        return TypedResults.NoContent();
    }

    /// <summary>Removes all items from the cart.</summary>
    internal static NoContent ClearCart(ICartService cartService)
    {
        cartService.Clear();
        return TypedResults.NoContent();
    }
}

/// <summary>Request body for adding a product to the cart.</summary>
public record AddToCartRequest(int ProductId, int Quantity);

/// <summary>Error response body.</summary>
public record CartError(string Error);

