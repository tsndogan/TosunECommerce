namespace ECommerce.Api.Models
{
    public class Brand
    {
        public int Id {get;set;}
        public string Name {get;set;} = default!;
        public string? Description {get;set;}
        public bool IsDeleted { get; set; } = false;
        public ICollection<Product> Products {get;set;} = new List<Product>(); 
    }
}