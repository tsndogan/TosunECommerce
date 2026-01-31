namespace ECommerce.Api.Models
{
    public class Category
    {
        public int Id {get;set;}
        public string Name {get;set;} = default!;
        public bool IsTechnicalCategory { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<Product> Products {get;set;} = new List<Product>(); 
    }
}