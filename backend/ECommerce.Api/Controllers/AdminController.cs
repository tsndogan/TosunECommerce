using System.Net.Security;
using Microsoft.AspNetCore.Mvc;
using ECommerce.Api.Models;
using ECommerce.Api.Data;
using Microsoft.AspNetCore.Identity;
using ECommerce.Api.Dtos.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public AdminController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
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

        [HttpGet("pending-sellers")]

        private async Task<ApplicationUser?> GetCurrentAdminAsync()
        {
            var email = GetEmailFromAuthorizationHeader();
            if (email == null)
            {
                return null;
            }
            var user = await _userManager.FindByEmailAsync(email);
            if(user == null)
            {
                return null;
            }
            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("Admin"))
            {
                return null;
            }
            return user;
        }
        [HttpGet("pending-sellers")]
        public async Task<IActionResult> GetPendingSellers()
        {
            var admin = await GetCurrentAdminAsync();
            if(admin == null)
            {
                return Unauthorized("Bu sayfaya yalnızca admin erişebilir.");
            }
            
            var sellers = await _db.SellerProfiles.Include(s => s.User).Where(s => s.Status == SellerStatus.Pending).Select(s => new
            {
                s.Id,
                s.ShopName,
                s.Description,
                UserEmail = s.User.Email
            }).ToListAsync();
            return Ok(sellers);
        }
        [HttpPost("approve-seller/{id:int}")]
        public async Task<IActionResult>ApproveSeller(int id)
        {
            var admin = await GetCurrentAdminAsync();
            if (admin == null)
            {
                return Unauthorized("Bu sayfaya yalnızca adminler erişebilir.");
            }
            
            var profile = await _db.SellerProfiles.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
            if(profile == null)
            {
                return NotFound("Satıcı profili bulunamadı.");
            }

            profile.Status = SellerStatus.Approved;
            await _db.SaveChangesAsync();
            await _userManager.AddToRoleAsync(profile.User, "Seller");
            return Ok("Satıcı profili onaylandı.");
        }
    }
}