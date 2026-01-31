using Microsoft.AspNetCore.Mvc;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Identity;
using ECommerce.Api.Dtos.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ECommerce.Api.Data;
using Microsoft.EntityFrameworkCore;
using ECommerce.Api.Dtos.Profile;
using ECommerce.Api.Dtos.Products;

namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;

        public ProductsController(ApplicationDbContext db, UserManager<ApplicationUser> userManager, IWebHostEnvironment env)
        {
            _db = db;
            _userManager = userManager;
            _env = env;
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

        private async Task<(ApplicationUser? user, SellerProfile? sellerProfile)> GetCurrentSellerAsync()
        {
            var email = GetEmailFromAuthorizationHeader();
            if(email == null)
            {
                return (null,null);
            }
            
            var user = await _userManager.Users.Include(u => u.SellerProfile).FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return (null,null);
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("Seller"))
            {
                return (null,null);
            }

            if(user.SellerProfile == null || user.SellerProfile.Status != SellerStatus.Approved)
            {
                return (user,null);
            }

            return (user, user.SellerProfile);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll(
            int pageSize = 18,
            int pageNumber = 1,
            int? categoryId = null,
            int? brandId = null,
            int? sellerId = null,
            string? sortBy = null
            )
        {   
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 10 : pageSize;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var query = _db.Products
                .Where(p => p.IsPublished)
                .Include(p => p.Category)
                .Include(p => p.SellerProfile)
                .Include(p => p.Brand)
                .AsQueryable();
            
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId);

            if (sellerId.HasValue)
                query = query.Where(p => p.SellerProfileId == sellerId);

            if (brandId.HasValue)
                query = query.Where(p => p.BrandId == brandId);

            query = sortBy switch
            {
                "priceAsc" => query.OrderBy(p => p.Price),
                "priceDesc" => query.OrderByDescending(p => p.Price),
                "nameAsc" => query.OrderBy(p => p.Name),
                "nameDesc" => query.OrderByDescending(p => p.Name),
                _ => query.OrderBy(p => p.Id)
            };
            int skip = (pageNumber - 1) * pageSize;
            var products = await query
                .Skip(skip)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Stock = p.Stock,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    Description = p.Description,
                    CategoryName = p.Category.Name,
                    SellerShopName = p.SellerProfile.ShopName,
                    BrandName = p.Brand.Name
                })
                .ToListAsync();
            return Ok(products);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDto>> GetById (int id)
        {
            var p = await _db.Products.Include(x => x.Category).Include(x => x.SellerProfile).FirstOrDefaultAsync(x => x.Id == id && x.IsPublished);
            if(p == null)
            {
                return NotFound("Ürün Bulunamadı");
            }

            var dto = new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Stock = p.Stock,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryName = p.Category.Name,
                SellerShopName = p.SellerProfile.ShopName
            };
            return Ok(dto);

            
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> MyProducts()
        {
            var (user, sellerProfile) = await GetCurrentSellerAsync();
            if(user == null)
            {
                return Unauthorized("Bu endpoint sadece Sellerlar içindir. Token da geçersiz olabilir");
            } 

            if(sellerProfile == null)
            {
                return BadRequest("Onaylı bir satıcı profiliniz bulunamadı.");
            }

            var products = await _db.Products.Where(p => p.SellerProfileId == sellerProfile.Id).Include(p => p.Category).Select(p => new ProductDto{
                Id = p.Id,
                Name = p.Name,
                Stock = p.Stock,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryName = p.Category.Name,
                SellerShopName = p.SellerProfile.ShopName
            }).ToListAsync();

            return Ok(products);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult>Create([FromForm] CreateProductDto dto)
        {
            var (user, sellerProfile) = await GetCurrentSellerAsync();

            if(user == null)
            {
                return Unauthorized("Bu endpoint sadece seller içindir veya token geçersiz.");
            } 

            if(sellerProfile == null)
            {
                return BadRequest("Onaylı bir satıcı profiliniz bulunmuyor.");
            }

            var category = await _db.Categories.FindAsync(dto.CategoryId);
            if(category == null)
            {
                return BadRequest("Category bulunamadı");
            }

            string? finalImgUrl = dto.ImageUrl;

            if(dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                var webRoot = _env.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRoot))
                {
                    webRoot = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot");
                }

                var uploadRoot = Path.Combine(webRoot, "upload", "products");
                Directory.CreateDirectory(uploadRoot);
                var ext = Path.GetExtension(dto.ImageFile.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadRoot, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                finalImgUrl = $"/uploads/products/{fileName}";
            }

            var products = new Product
            {
                Name = dto.ProductName,
                Stock = dto.Stock,
                Price = dto.Price,
                ImageUrl = finalImgUrl,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                BrandId = dto.BrandId,
                SellerProfileId = sellerProfile.Id,
                IsPublished = true
            };
            _db.Products.Add(products);
            await _db.SaveChangesAsync();
            return Ok("Ürün başarıyla oluşturuldu.");
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult>Update(int id, [FromForm] CreateProductDto dto)
        {
            var (user, sellerProfile) = await GetCurrentSellerAsync();

            if(user == null)
            {
                return Unauthorized("Bu endpoint sadece seller içindir veya token geçersiz.");
            } 

            if(sellerProfile == null)
            {
                return BadRequest("Onaylı bir satıcı profiliniz bulunmuyor.");
            }

            var products = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (products == null)
            {
                return NotFound("Ürün bulunamadı");
            }

            if(products.SellerProfileId != sellerProfile.Id)
            {
                return Forbid("Güncelleme yetkisi yok");
            }

            var category = await _db.Categories.FindAsync(dto.CategoryId);
            if(category == null)
            {
                return BadRequest("Kategori yok");
            }

            products.Name = dto.ProductName;
            products.Stock = dto.Stock;
            products.Price = dto.Price;
            products.Description = dto.Description;
            products.CategoryId = dto.CategoryId;
            products.BrandId  = dto.BrandId;

            string? finalImgUrl = dto.ImageUrl;

            if(dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                var webRoot = _env.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRoot))
                {
                    webRoot = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot");
                }

                var uploadRoot = Path.Combine(webRoot, "upload", "products");
                Directory.CreateDirectory(uploadRoot);
                var ext = Path.GetExtension(dto.ImageFile.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadRoot, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                finalImgUrl = $"/uploads/products/{fileName}";
            }

            products.ImageUrl = finalImgUrl;
            await _db.SaveChangesAsync();
            return Ok("Ürün güncellendi");            
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult>Delete(int id)
        {
            var email = GetEmailFromAuthorizationHeader();
            if(email == null)
            {
                return Unauthorized("Auth header yok veya token geçersiz");
            }

            var user = await _userManager.Users.Include(u => u.SellerProfile).FirstOrDefaultAsync(u => u.Email == email);
            if(user == null)
            {
                return Unauthorized("token içindeki kullanıcı sistemde yok.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var products = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
            if(products == null)
            {
                return NotFound("ürün yok");
            }

            var isAdmin = roles.Contains("Admin");
            var isOwnerSeller = user.SellerProfile != null && user.SellerProfile.Id == products.SellerProfileId;
            if(!isAdmin && !isOwnerSeller)
            {
                return Forbid("ürün silme yetkisi yok");
            }

            _db.Products.Remove(products);
            await _db.SaveChangesAsync();
            return Ok("Ürün silindi.");
        }

    }
}