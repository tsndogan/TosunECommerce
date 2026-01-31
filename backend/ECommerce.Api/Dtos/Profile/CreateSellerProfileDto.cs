using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Dtos.Profile
{
    public class CreateSellerProfileDto
    {
        [Required]
        public string ShopName {get;set;} = default!;
        [Required]
        public string? Description {get;set;}
    }
}