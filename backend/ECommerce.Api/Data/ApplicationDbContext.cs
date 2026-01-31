using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ECommerce.Api.Models;

namespace ECommerce.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        :base(options)
        {}

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Brand> Brands => Set<Brand>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<SellerProfile> SellerProfiles => Set<SellerProfile>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                    .HasOne(u => u.SellerProfile)
                    .WithOne(s => s.User)
                    .HasForeignKey<SellerProfile>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<Category>()
                    .HasMany(c => c.Products)
                    .WithOne(p => p.Category)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Category>()
                .HasIndex(c => c.Name)
                .IsUnique();
            
            builder.Entity<Brand>()
                    .HasMany(b => b.Products)
                    .WithOne(p => p.Brand)
                    .HasForeignKey(p => p.BrandId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Brand>()
                .HasIndex(b => b.Name)
                .IsUnique();
            
            builder.Entity<SellerProfile>()
                    .HasMany(s => s.Products)
                    .WithOne(p => p.SellerProfile)
                    .HasForeignKey(p => p.SellerProfileId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Product>()
                .Property(p => p.ErgonomyLevel)
                .HasConversion<string>();

            builder.Entity<Product>()
                .HasQueryFilter(p => !p.IsDeleted);
            
            builder.Entity<CartItem>()
                .HasIndex(ci => new { ci.UserId, ci.ProductId })
                .IsUnique();
            
            builder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<Brand>()
                .Property(b => b.IsDeleted)
                .HasConversion<int>()
                .HasDefaultValue(0)
                .IsRequired();
        }
        
    }
}