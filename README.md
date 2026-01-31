# 🛒 Tosun E-Commerce Platform

Modern bir e-ticaret platformu. Kullanıcılar ürün satın alabilir, satıcılar kendi mağazalarını yönetebilir ve adminler sistemi denetleyebilir.

## 📋 Proje Hakkında

**Tosun E-Commerce**, bilgisayar aksesuar ürünleri (klavye, mouse vb.) satışı için tasarlanmış tam teşekküllü bir e-ticaret platformudur. Sistem üç ana rol ile çalışır:

- **Admin**: Sistem yönetimi, kategori/brand yönetimi, kullanıcı denetimi
- **Seller**: Kendi mağazası ve ürünlerini yönetme
- **Buyer**: Ürün arama, satın alma ve review yazma

---

## 🏗️ Teknoloji Stack'i

### Backend
- **.NET 9.0** - Web API
- **C#** - Programlama dili
- **Entity Framework Core 9.0.1** - ORM
- **SQLite** - Veritabanı
- **JWT (JSON Web Token)** - Kimlik doğrulama
- **Swagger/OpenAPI** - API Dokumentasyonu
- **ASP.NET Core Identity** - Kullanıcı yönetimi

### Frontend
- **React 19.2.0** - UI Framework
- **Vite 7.2.4** - Build tool
- **TailwindCSS 4.1.18** - Styling
- **Axios** - HTTP Client
- **React Query** - State management
- **React Router DOM** - Routing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy / Web server

---

## 🚀 Hızlı Başlangıç

### Ön Koşullar
- Docker & Docker Compose
- Node.js 18+ (local development için)
- .NET 9.0 SDK (local development için)

### Kurulum (Docker ile)

1. **Proje dizinine gir**
```bash
cd TosunECommerce
```

2. **Docker container'larını başlat**
```bash
docker-compose up --build
```

3. **Hizmetlere erişim**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Swagger: http://localhost:5000/swagger/index.html

### Local Development (Docker olmadan)

**Backend:**
```bash
cd backend/ECommerce.Api
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd frontend/ecommerce-ui
npm install
npm run dev
```

---

## 📁 Proje Yapısı

```
TosunECommerce/
├── backend/
│   └── ECommerce.Api/
│       ├── Controllers/          # API Endpoints
│       │   ├── AuthController.cs
│       │   ├── ProductsController.cs
│       │   ├── CartController.cs
│       │   ├── CategoriesController.cs
│       │   ├── BrandController.cs
│       │   ├── SellerController.cs
│       │   ├── AdminController.cs
│       │   └── ProfileController.cs
│       ├── Models/              # Entity Models
│       │   ├── ApplicationUser.cs
│       │   ├── Product.cs
│       │   ├── Category.cs
│       │   ├── Brand.cs
│       │   ├── CartItem.cs
│       │   ├── Order.cs
│       │   ├── OrderItem.cs
│       │   ├── Review.cs
│       │   ├── SellerProfile.cs
│       │   └── Enums/
│       ├── Dtos/               # Data Transfer Objects
│       ├── Data/               # Database Context
│       ├── Migrations/         # EF Core Migrations
│       ├── Program.cs
│       ├── appsettings.json
│       └── Dockerfile
├── frontend/
│   └── ecommerce-ui/
│       ├── src/
│       │   ├── components/     # React Components
│       │   ├── pages/          # Page Components
│       │   ├── services/       # API Services
│       │   └── App.jsx
│       ├── package.json
│       ├── Dockerfile
│       └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## 🔐 Kimlik Doğrulama & Yetkilendirme


### Varsayılan Admin Hesabı
```
Email: doganadmin.61@tosunec.com
Şifre: Admin.240902.
```

Admin Dashboardu için localhost:3000/admin/dashboard sayfasına gidiniz.

### Kullanıcı Rolleri

| Role | Yetkiler |
|------|----------|
| **Admin** | Sistem yönetimi, kategori/brand yönetimi, tüm ürünleri görebilir |
| **Seller** | Kendi mağazasını ve ürünlerini yönetme, satış raporları |
| **Buyer** | Ürün arama, sepete ekleme, satın alma |

### JWT Token
- **İssuer**: ECommerce.Api
- **Audience**: ECommerce.Api
- **Expires**: 60 dakika (appsettings.json'da ayarlanabilir)

---

## 🗄️ Veritabanı Şeması

### Ana Tablolar

**AspNetUsers** - Kullanıcılar
```
- Id (PK)
- UserName
- Email
- FullName
- PasswordHash
```

**Categories** - Ürün Kategorileri
```
- Id (PK)
- Name
- IsTechnicalCategory
- DisplayOrder
- IsDeleted (Soft Delete)
```

**Brands** - Markalar
```
- Id (PK)
- Name
- Description
- IsDeleted
```

**Products** - Ürünler
```
- Id (PK)
- Name
- Description
- Price
- Stock
- ImageUrl
- CategoryId (FK)
- BrandId (FK)
- SellerProfileId (FK)
- ErgonomyLevel
- ConnectivityType
- SupportedOS
- WarrantyMonths
- IsPublished
- CreatedAt
- UpdatedAt
- IsDeleted
```

**CartItems** - Sepet Öğeleri
```
- Id (PK)
- UserId (FK)
- ProductId (FK)
- Quantity
- UnitPrice
- ReservedUntil
- CreatedAt
```

**Orders** - Siparişler
```
- Id (PK)
- UserId (FK)
- TotalPrice
- OrderTime
- Status
```

**OrderItems** - Sipariş Detayları
```
- Id (PK)
- OrderId (FK)
- ProductId (FK)
- Quantity
- UnitPrice
- ProductNameSnapShot
```

**Reviews** - Ürün İnceleme Yazıları
```
- Id (PK)
- ProductId (FK)
- UserId (FK)
- Rating
- Comment
- IsAppropriate
- CreatedAt
- IsDeleted
```

**SellerProfiles** - Satıcı Profilleri
```
- Id (PK)
- UserId (FK)
- ShopName
- Description
- Rating
- TotalSales
- IsVerified
- CreatedAt
- Status
- IsDeleted
```

---

## 🔗 API Endpoints

### Kimlik Doğrulama
```
POST   /api/auth/register     - Kayıt ol
POST   /api/auth/login        - Giriş yap
```

### Ürünler
```
GET    /api/products          - Tüm ürünleri listele
GET    /api/products/{id}     - Ürün detayı
POST   /api/products          - Ürün oluştur (Seller)
PUT    /api/products/{id}     - Ürün güncelle (Seller)
DELETE /api/products/{id}     - Ürün sil (Seller/Admin)
```

### Kategoriler
```
GET    /api/categories        - Tüm kategorileri listele
POST   /api/categories        - Kategori oluştur (Admin)
PUT    /api/categories/{id}   - Kategori güncelle (Admin)
DELETE /api/categories/{id}   - Kategori sil (Admin)
```

### Markalar
```
GET    /api/brands            - Tüm markaları listele
POST   /api/brands            - Brand oluştur (Admin)
PUT    /api/brands/{id}       - Brand güncelle (Admin)
DELETE /api/brands/{id}       - Brand sil (Admin)
```

### Sepet
```
POST   /api/cart/add          - Sepete ürün ekle
GET    /api/cart              - Sepeti görüntüle
DELETE /api/cart/remove       - Sepetten çıkar
POST   /api/cart/checkout     - Satın al
```

### Siparişler
```
GET    /api/orders            - Siparişlerimi listele
GET    /api/orders/{id}       - Sipariş detayı
```

### Profil
```
GET    /api/profile           - Profili görüntüle
PUT    /api/profile           - Profili güncelle
POST   /api/profile/seller    - Satıcı profili oluştur
```

---

## 🛠️ Geliştirme Rehberi

### Yeni API Endpoint Ekleme

1. **DTO oluştur** (`Dtos/` klasöründe)
```csharp
public class MyDto
{
    public string Name { get; set; }
}
```

2. **Controller metodu ekle**
```csharp
[HttpGet("endpoint")]
public async Task<IActionResult> MyEndpoint()
{
    return Ok(new MyDto { Name = "Test" });
}
```

3. **Migration gerekirse**
```bash
dotnet ef migrations add AddMyTable
dotnet ef database update
```

### Yeni React Component Oluşturma

1. **Component dosyası oluştur** (`src/components/` veya `src/pages/`)
```jsx
export function MyComponent() {
  return <div>Hello</div>;
}
```

2. **App.jsx'e route ekle** (page ise)
```jsx
<Route path="/my-page" element={<MyComponent />} />
```

---

## 📦 Docker Komutları

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Backend loglarını gör
docker-compose logs backend -f

# Frontend loglarını gör
docker-compose logs frontend -f

# Servisleri durdur
docker-compose down

# Yeniden derle ve başlat
docker-compose up --build

# Belirli servisi yeniden başlat
docker-compose restart backend
```

---

## 🐛 Sorun Giderme

### Backend 5000 portunda açılmıyor
```bash
# Port kullanımını kontrol et
netstat -ano | findstr :5000

# Container loglarını kontrol et
docker-compose logs backend
```

### Frontend API'ye erişemiyor
- `nginx.conf` dosyasında proxy ayarlarını kontrol et
- Backend'in çalışıp çalışmadığını doğrula
- CORS ayarlarını kontrol et (`Program.cs`)

### Database bağlantı hatası
```bash
# Container'ı temizle ve yeniden başlat
docker-compose down -v
docker-compose up --build
```

---

## 📝 Yapılacak Özellikler

- [ ] Ödeme entegrasyonu (Stripe/PayPal)
- [ ] Email notifikasyonları
- [ ] Arama ve filtreleme optimizasyonu
- [ ] Caching (Redis)
- [ ] Test coverage (%80+)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Admin dashboard
- [ ] Satıcı analytics
- [ ] Müşteri desteği (chat)

---

## 📞 İletişim & Destek

- **Developer**: Dogan Tosun
- **Email**: dogantsn61@gmail.com

---

## 🎯 Proje Hedefleri

✅ Modern e-commerce platformu oluşturmak
✅ Mikro-servis mimarisi (Backend/Frontend ayrımı)
✅ Docker ile production-ready deployment
✅ JWT tabanlı güvenli kimlik doğrulama
✅ Soft delete ile veri integritysi
✅ Responsive tasarım

---

**Son Güncelleme**: 31 Ocak 2026
