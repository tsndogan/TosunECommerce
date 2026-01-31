using ECommerce.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommenrce.Api.Controllers
{
    [ApiController]
    [Route("api/brands")]
    public class BrandController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public BrandController(ApplicationDbContext db)
        {
            _db = db;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _db.Brands
                .AsNoTracking()
                .Select(b => new
                {
                    b.Id,
                    b.Name
                })
                .ToListAsync();

            return Ok(brands);
        }
    }
}