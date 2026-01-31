using ECommerce.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers
{
    [ApiController]
    [Route("api/sellers")]
    public class SellerController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public SellerController(ApplicationDbContext db)
        {
            _db = db;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sellers = await _db.SellerProfiles
                .AsNoTracking()
                .Select(s => new
                {
                    s.Id,
                    s.ShopName
                })
                .ToListAsync();

            return Ok(sellers);
        }
    }
}