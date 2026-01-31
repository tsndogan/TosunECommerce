using ECommerce.Api.Models.Enums;
namespace ECommerce.Api.Dtos.Products
{
    public class CreateProductDto
    {
        public string ProductName {get;set;} = default!;
        public int Stock {get;set;}
        public decimal Price {get;set;}
        public string? Description {get;set;}
        public int CategoryId {get;set;}
        public int BrandId {get;set;}
        public string? ImageUrl {get;set;}
        public IFormFile? ImageFile {get;set;}
        public ErgonomyLevel ErgonomyLevel {get;set;}
        public string? ConnectivityType {get;set;}
        public string? SupportedOS {get;set;}
        public int WarrantyMonths {get;set;}
    }
}