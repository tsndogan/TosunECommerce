import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function SellerCreateProductPage() {
  
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  
  const [formData, setFormData] = useState({
    ProductName: "",
    Description: "",
    Price: "",
    Stock: "",
    CategoryId: "",
    BrandId: "",
    ImageUrl: "",
    ConnectivityType: "",
    SupportedOS: "",
    WarrantyMonths: "",
    ErgonomyLevel: "1",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/api/categories");
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await api.get("/api/brands");
      return data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data } = await api.post("/api/Products", fd);
      return data;
    },
    onSuccess: () => {
      alert("Ürün başarıyla eklendi!");
      navigate("/seller/products");
    },
    onError: (error: any) => {
      alert(error?.response?.data || "Ürün eklenirken hata oluştu");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.ProductName ||
      !formData.Price ||
      !formData.Stock ||
      !formData.CategoryId ||
      !formData.BrandId
    ) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    const fd = new FormData();

    fd.append("ProductName", formData.ProductName);
    fd.append("Description", formData.Description);
    fd.append("Price", formData.Price);
    fd.append("Stock", formData.Stock);
    fd.append("CategoryId", formData.CategoryId);
    fd.append("BrandId", formData.BrandId);
    fd.append("ConnectivityType", formData.ConnectivityType);
    fd.append("SupportedOS", formData.SupportedOS);
    fd.append("WarrantyMonths", formData.WarrantyMonths);
    fd.append("ErgonomyLevel", formData.ErgonomyLevel);

    if (formData.ImageUrl) {
      fd.append("ImageUrl", formData.ImageUrl);
    }

    createProductMutation.mutate(fd);
  };

  return (
    <div className="min-h-screen bg-slate-50">
        <div>
  <label className="block text-sm font-medium text-slate-700 mb-3">
    Ürün Görseli
  </label>

  <div className="flex items-start gap-6">
    {imagePreview ? (
      <div className="relative">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-48 h-48 object-cover rounded-xl border-2 border-slate-200"
        />
        <button
          type="button"
          onClick={() => {
            setImageFile(null);
            setImagePreview(null);
          }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
        >
          ×
        </button>
      </div>
    ) : (
      <div className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Görsel yok</div>
        </div>
      </div>
    )}

    <div className="flex-1">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
      />
      <p className="mt-2 text-sm text-slate-500">
        Dosyadan görsel yükleyebilirsiniz (URL opsiyonel)
      </p>
    </div>
  </div>
</div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Yeni Ürün Ekle</h1>
          <p className="text-slate-600">Mağazanıza yeni bir ürün ekleyin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ProductName"
                value={formData.ProductName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Örn: Logitech MX Master 3S"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Ürün hakkında detaylı bilgi..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="Stock"
                  value={formData.Stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="CategoryId"
                  value={formData.CategoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marka <span className="text-red-500">*</span>
                </label>
                <select
                  name="BrandId"
                  value={formData.BrandId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {brands?.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ürün Resmi URL
              </label>
              <input
                type="url"
                name="ImageUrl"
                value={formData.ImageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bağlantı Tipi
                </label>
                <input
                  type="text"
                  name="ConnectivityType"
                  value={formData.ConnectivityType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Kablosuz, Bluetooth, USB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Desteklenen OS
                </label>
                <input
                  type="text"
                  name="SupportedOS"
                  value={formData.SupportedOS}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Windows, macOS, Linux"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Garanti (Ay)
                </label>
                <input
                  type="number"
                  name="WarrantyMonths"
                  value={formData.WarrantyMonths}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ergonomi Seviyesi
                </label>
                <select
                  name="ErgonomyLevel"
                  value={formData.ErgonomyLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="0">Düşük</option>
                  <option value="1">Orta</option>
                  <option value="2">Yüksek</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {createProductMutation.isPending ? "Ekleniyor..." : "Ürünü Ekle"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}