using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Api.Data;
using ECommerce.Api.Models;
using ECommerce.Api.Dtos.Categories;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminCategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    Description = c.IsTechnicalCategory ? "Teknik Ürün" : "Standart Ürün",
                    c.DisplayOrder,
                    ProductCount = c.Products.Where(p => !p.IsDeleted).Count()
                })
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();
            
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            
            if (category == null)
                return NotFound("Kategori bulunamadı");
            
            return Ok(new
            {
                category.Id,
                category.Name,
                category.IsTechnicalCategory,
                category.DisplayOrder
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] dynamic dto)
        {
            if (dto == null)
                return BadRequest("Geçersiz kategori verisi");

            string name = dto?.Name ?? dto?.name;
            
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Kategori adı boş olamaz");

            // Aynı isimde kategori var mı kontrol et
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == name && !c.IsDeleted);
            
            if (existingCategory != null)
                return BadRequest("Bu kategorı adı zaten kullanılıyor");

            var category = new Category
            {
                Name = name.Trim(),
                IsTechnicalCategory = false,
                DisplayOrder = await _context.Categories.CountAsync(c => !c.IsDeleted),
                IsDeleted = false
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                category.Id,
                category.Name,
                message = "Kategori başarıyla oluşturuldu"
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] dynamic dto)
        {
            if (dto == null)
                return BadRequest("Geçersiz kategori verisi");

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            
            if (category == null)
                return NotFound("Kategori bulunamadı");

            string name = dto?.Name ?? dto?.name;
            
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Kategori adı boş olamaz");

            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == name && c.Id != id && !c.IsDeleted);
            
            if (existingCategory != null)
                return BadRequest("Bu kategorı adı zaten kullanılıyor");

            category.Name = name.Trim();

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                category.Id,
                category.Name,
                message = "Kategori başarıyla güncellendi"
            });
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            
            if (category == null)
                return NotFound("Kategori bulunamadı");

            // Kategoriye bağlı ürün var mı kontrol et
            var productCount = await _context.Products
                .CountAsync(p => p.CategoryId == id && !p.IsDeleted);

            if (productCount > 0)
                return BadRequest($"Bu kategoriye {productCount} adet ürün bağlı. Önce ürünleri taşıyın veya silin.");

            category.IsDeleted = true;
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kategori başarıyla silindi" });
        }
    }
}