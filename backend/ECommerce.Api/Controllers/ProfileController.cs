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
using Microsoft.AspNetCore.Authorization;

namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/profile")]

    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public ProfileController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
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

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var email = GetEmailFromAuthorizationHeader();
            if(email == null)
            {
                return Unauthorized("Authorization Header yok, bearer token yok veya token parse edilmemiş.");
            }
            var user = await _userManager.Users.Include(u => u.SellerProfile).FirstOrDefaultAsync(u => u.Email == email);
            if(user == null)
            {
                return Unauthorized("Token içindeki kullanıcı sistemde bulunamadı");
            }
            SellerProfileDto? sellerdto = null;
            
            if(user.SellerProfile != null){
            sellerdto = new SellerProfileDto
            {
                Id = user.SellerProfile.Id,
                ShopName = user.SellerProfile.ShopName,
                Description = user.SellerProfile.Description,
                Status = user.SellerProfile.Status.ToString()
            };
            }
            return Ok(new
            {
                user.FullName,
                user.Email,
                SellerProfile = sellerdto
            });
        }

        [HttpPost("become-seller")]
        public async Task<IActionResult> BecomeSeller([FromBody] CreateSellerProfileDto dto)
{
    var authHeader = Request.Headers["Authorization"].ToString();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
    {
        return Unauthorized(new { message = "Token eksik" });
    }

    var token = authHeader.Substring("Bearer ".Length).Trim();
    
    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var jwtToken = handler.ReadJwtToken(token);
    var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
    
    if (string.IsNullOrEmpty(userId))
    {
        return Unauthorized(new { message = "User ID bulunamadı" });
    }

    var user = await _userManager.Users
        .Include(u => u.SellerProfile)
        .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null)
    {
        return Unauthorized(new { message = "Kullanıcı bulunamadı" });
    }

    if(user.SellerProfile != null)
    {
        return BadRequest(new { message = "Zaten satıcı başvurusu yapmışsınız" });
    }

    var profile = new SellerProfile
    {
        UserId = user.Id,
        ShopName = dto.ShopName,
        Description = dto.Description,
        Status = SellerStatus.Pending
    };

    _db.SellerProfiles.Add(profile);
    await _db.SaveChangesAsync();

    return Ok(new { message = "Satıcı başvurunuz alındı" });
}
    }
}