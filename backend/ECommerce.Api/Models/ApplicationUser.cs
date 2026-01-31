using Microsoft.AspNetCore.Identity;
namespace ECommerce.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName{get;set;}
        public SellerProfile? SellerProfile{get;set;}
    }

}