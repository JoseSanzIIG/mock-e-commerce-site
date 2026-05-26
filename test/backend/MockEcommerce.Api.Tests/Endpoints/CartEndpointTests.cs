using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MockEcommerce.Api.Models;

namespace MockEcommerce.Api.Tests.Endpoints;

// DTOs for deserializing responses
file record CartSummaryDto(List<CartItemDto> Items, decimal CartTotal);
file record CartItemDto(int ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal TotalPrice);
file record CartErrorDto(string Error);

public class CartEndpointTests
{
    private static HttpClient CreateClient() =>
        new WebApplicationFactory<Program>().CreateClient();

    [Fact]
    public async Task GetCart_OnEmptyCart_ReturnsOkWithEmptyItems()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/cart");

        response.EnsureSuccessStatusCode();
        var summary = await response.Content.ReadFromJsonAsync<CartSummaryDto>();
        Assert.NotNull(summary);
        Assert.Empty(summary.Items);
        Assert.Equal(0, summary.CartTotal);
    }

    [Fact]
    public async Task AddToCart_ValidRequest_Returns201WithCartItem()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItemDto>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        Assert.Equal(1, item.Quantity);
    }

    [Fact]
    public async Task AddToCart_DuplicateItem_Returns200AndIncrementsQuantity()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItemDto>();
        Assert.NotNull(item);
        Assert.Equal(2, item.Quantity);
    }

    [Fact]
    public async Task AddToCart_QuantityZero_Returns400()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 0 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AddToCart_InvalidProductId_Returns404()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/cart", new { productId = 9999, quantity = 1 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddToCart_WouldExceedMaxQuantity_Returns400()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 3 });

        var response = await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 3 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_ValidRequest_Returns200WithUpdatedItem()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.PutAsJsonAsync("/api/cart/1", new { quantity = 3 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItemDto>();
        Assert.NotNull(item);
        Assert.Equal(3, item.Quantity);
    }

    [Fact]
    public async Task UpdateCartItem_QuantityZero_Returns400()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.PutAsJsonAsync("/api/cart/1", new { quantity = 0 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_QuantityAboveMax_Returns400()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.PutAsJsonAsync("/api/cart/1", new { quantity = 6 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_ItemNotInCart_Returns404()
    {
        var client = CreateClient();

        var response = await client.PutAsJsonAsync("/api/cart/9999", new { quantity = 3 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RemoveFromCart_ExistingItem_Returns204()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.DeleteAsync("/api/cart/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task RemoveFromCart_MissingItem_Returns404()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync("/api/cart/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ClearCart_Returns204()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await client.DeleteAsync("/api/cart");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ClearCart_OnEmptyCart_Returns204()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync("/api/cart");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
