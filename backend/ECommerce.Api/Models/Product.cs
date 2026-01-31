using ECommerce.Api.Models.Enums;

namespace ECommerce.Api.Models
{
    public class Product
    {
        public int Id {get;set;}
        public string Name {get;set;} = default!;
        public int Stock {get;set;}
        public decimal Price {get;set;}
        public string? ImageUrl {get;set;}
        public string? Description {get;set;}
        public int CategoryId {get;set;}
        public Category Category {get;set;} = default!;
        public int BrandId {get;set;}
        public Brand Brand {get;set;} = default!;
        public int SellerProfileId {get;set;}
        public SellerProfile SellerProfile {get;set;} = default!;
        public ErgonomyLevel ErgonomyLevel {get;set;}
        public string? ConnectivityType {get;set;}
        public string? SupportedOS {get;set;}
        public int WarrantyMonths {get;set;}
        public bool IsPublished {get;set;} = true;
        public DateTime CreatedAt {get;set;} = default!;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}