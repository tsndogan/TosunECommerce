namespace ECommerce.Api.Models
{
    public class Review
    {
        public int Id {get;set;}
        public int ProductId {get;set;}
        public Product Product {get;set;} = default!;
        public string UserId {get;set;} = default!;
        public ApplicationUser ApplicationUser {get;set;} = default!;
        public decimal Rating {get;set;}
        public string Comment {get;set;} = default!;
        public bool IsAppropriate {get;set;}
        public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}