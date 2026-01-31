using ECommerce.Api.Models.Enums;
namespace ECommerce.Api.Dtos.Products
{   
    public class ProductDto {
        public int Id {get;set;}
        public string Name {get;set;} = default!;
        public int Stock {get;set;}
        public decimal Price {get;set;}
        public string? ImageUrl {get;set;}
        public string? Description {get;set;}
        public string CategoryName {get;set;} = default!;
        public string SellerShopName {get;set;} = default!;
        public string BrandName {get;set;} = default!;
        public ErgonomyLevel ErgonomyLevel {get;set;}
        public string? ConnectivityType {get;set;}
        public string? SupportedOS {get;set;}
        public int WarrantyMonths {get;set;}
    }
}