using Microsoft.AspNetCore.Mvc;
using ECommerce.Api.Models;
using Microsoft.AspNetCore.Identity;
using ECommerce.Api.Dtos.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;


namespace ECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;
        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult>Register(RegisterDto dto)
        {
            try
            {
                var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            await _userManager.AddToRoleAsync(user, "Buyer");
            return Ok(new { message = "Kayıt başarılı. Şuanda alıcı profiliniz oluşturuldu." });
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());
            }
            
        }

        [HttpPost("login")]
        public async Task<IActionResult>Login([FromBody] LoginDto dto){
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if(user == null)
            {
                return Unauthorized("Geçersiz kullanıcı veya şifre");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if(!passwordValid)
            {
                return Unauthorized("Geçersiz kullanıcı adı veya şifre");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var mainRole = roles.FirstOrDefault() ?? "Buyer";

            var token = GenerateJwt(user,roles);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Role = mainRole
            });
        }

        private string GenerateJwt(ApplicationUser user, IList<string> roles)
        {
            var jwtSettings = _config.GetSection("Jwt");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

            var creds = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.FullName ?? user.Email ?? "")
            };

            foreach(var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer : jwtSettings["Issuer"],
                audience :  jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresInMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}