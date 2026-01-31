using Microsoft.AspNetCore.Mvc;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Identity;
using ECommerce.Api.Dtos.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ECommerce.Api.Dtos.Cart;
using ECommerce.Api.Dtos.Orders;
using ECommerce.Api.Data;
using Microsoft.EntityFrameworkCore;
using ECommerce.Api.Dtos.Profile;
using ECommerce.Api.Dtos.Products;

namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public CartController (ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        private string? GetEmailFromAuthorizationHeader()
        {
            if(!Request.Headers.TryGetValue("Authorization", out var autHeaderValues)){
                return null;
            }

            var autHeader = autHeaderValues.ToString();
            if (string.IsNullOrEmpty(autHeader))
            {
                return null;
            }

            const string bearerPrefix = "Bearer ";
            if(!autHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var token = autHeader[bearerPrefix.Length..].Trim();
            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
            }
            
            JwtSecurityToken jwt;
            try
            {
                var handler = new JwtSecurityTokenHandler();
                jwt = handler.ReadJwtToken(token);
            }
            catch (System.Exception)
            {
                return null;
            }

            var email = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value;

            return string.IsNullOrWhiteSpace(email) ? null : email;
        }

        private async Task<ApplicationUser?> GetCurrentUserAsync()
        {
            var email = GetEmailFromAuthorizationHeader();
            if(email == null)
            {
                return null;
            }

            return await _userManager.FindByEmailAsync(email);
        }
        [HttpPost("add")]
        public async Task<IActionResult>AddToCart([FromForm] AddToCartDto dto)
        {
            var user = await GetCurrentUserAsync();
            if(user == null)
            {
                return Unauthorized("Giriş yapılmamış veya token geçersiz.");
            }

            if(dto.Quantity <= 0)
            {
                return BadRequest("Adet 1 veya daha büyük olmalı");
            }

            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.IsPublished);
            if(product == null)
            {
                return NotFound("Ürün bulunamadı");
            }

            if(dto.Quantity > product.Stock)
            {
                return BadRequest("yeterli stok yok");
            }

            var existingItem = await _db.CartItems.FirstOrDefaultAsync(ci => ci.UserId == user.Id && ci.ProductId == product.Id);
            if(existingItem == null)
            {
                var newItem = new CartItem
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price
                };

                _db.CartItems.Add(newItem);
            }

            else
            {
                var newQty = existingItem.Quantity + dto.Quantity;
                if (newQty > product.Stock)
                {
                    return BadRequest("Bu kadar adet sepete eklenemiyor, stok yetersiz.");
                }
                existingItem.Quantity = newQty;
                existingItem.UnitPrice = product.Price;
            }
            await _db.SaveChangesAsync();
            return Ok("ürün sepete eklendi.");
        }

        [HttpPost("remove")]
        public async Task<IActionResult>RemoveFromCart([FromForm] RemoveFromCartDto dto)
        {
            var user = await GetCurrentUserAsync();
            if(user == null)
            {
                return Unauthorized("giriş yapılmamış veya token geçersiz.");
            }

            var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.UserId == user.Id && ci.ProductId == dto.ProductId);
            if(item == null)
            {
                return NotFound("Sepette zaten ürün yok");
            }

            if(dto.Quantity == null || dto.Quantity <= 0 || dto.Quantity >= item.Quantity)
            {
                _db.CartItems.Remove(item);
            }

            else
            {
                item.Quantity -= dto.Quantity.Value;
            }

            await _db.SaveChangesAsync();
            return Ok("Sepet güncellendi");
        }

        [HttpGet("my-cart")]
        public async Task<ActionResult<CartSummaryDto>> MyCart()
        {
            var user = await GetCurrentUserAsync();
            if(user == null)
            {
                return Unauthorized("Giriş yapılmamıi veya token geçersiz");
            }

            var items = await _db.CartItems.Where(ci => ci.UserId == user.Id).Include(ci => ci.Product).ToListAsync();
            var dto = new CartSummaryDto();

            foreach(var ci in items)
            {
                var line = new CartItemDto
                {
                  ProductId = ci.ProductId,
                  ProductName = ci.Product.Name,
                  UnitPrice = ci.Product.Price,
                  Quantity = ci.Quantity,
                  ImageUrl = ci.Product.ImageUrl
                };

                dto.Items.Add(line);
            }
            dto.TotalPrice = dto.Items.Sum(i => i.LineTotal);
            return Ok(dto);
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<OrderDto>> Checkout()
        {
            var user = await GetCurrentUserAsync();
            if(user == null)
            {
                return Unauthorized("Giriş yapılmamıi veya token geçersiz");
            }

            var cartItems = await _db.CartItems.Where(ci => ci.UserId == user.Id).Include(ci => ci.Product).ToListAsync();
            if (!cartItems.Any())
            {
                return BadRequest("sepet boş");
            }

            foreach (var ci in cartItems)
            {
                if (!ci.Product.IsPublished)
                {
                    return BadRequest($"{ci.Product.Name}'ürünü yayında değil.");
                }

                if(ci.Quantity > ci.Product.Stock)
                {
                    return BadRequest($"{ci.Product.Name}'ürünü yeterli sayıda değil.");
                }
            }

            var order = new Order
            {
                UserId = user.Id,
                OrderTime = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                TotalPrice = 0
            };

            foreach(var ci in cartItems)
            {
                var orderItem = new OrderItem
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.UnitPrice,
                    ProductNameSnapShot = ci.Product.Name
                };
                order.OrderItems.Add(orderItem);
                order.TotalPrice += ci.UnitPrice * ci.Quantity;

                ci.Product.Stock -= ci.Quantity;
            }

            _db.Orders.Add(order);
            _db.CartItems.RemoveRange(cartItems);
            await _db.SaveChangesAsync();

            var orderDto = new OrderDto
            {
                Id = order.Id,
                CreatedAt = order.OrderTime,    
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductNameSnapShot,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };
            return Ok(orderDto);
        }
    }
}