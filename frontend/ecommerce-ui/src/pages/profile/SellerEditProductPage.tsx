import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function SellerEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: "",
    stock: 0,
    price: 0,
    description: "",
    categoryId: 0,
    ergonomyLevel: 0,
    connectivityType: "",
    supportedOS: "",
    warrantyMonths: 12,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: product, isLoading: productLoading } = useQuery({
  queryKey: ["product", id],
  queryFn: async () => {
    const { data } = await api.get(`/api/Products/${id}`);
    return data;
  },
  enabled: !!id,
});

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Kategoriler yüklenemedi");
      return response.json();
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.name || "",
        stock: product.stock || 0,
        price: product.price || 0,
        description: product.description || "",
        categoryId: product.categoryId || 0,
        ergonomyLevel: product.ergonomyLevel || 0,
        connectivityType: product.connectivityType || "",
        supportedOS: product.supportedOS || "",
        warrantyMonths: product.warrantyMonths || 12,
      });
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    }
  }, [product]);

  const updateProductMutation = useMutation({
  mutationFn: async (data: any) => {
    const formDataToSend = new FormData();

    formDataToSend.append("ProductName", data.productName);
    formDataToSend.append("Stock", String(data.stock));
    formDataToSend.append("Price", String(data.price));
    formDataToSend.append("Description", data.description);
    formDataToSend.append("CategoryId", String(data.categoryId));
    formDataToSend.append("ErgonomyLevel", String(data.ergonomyLevel));
    formDataToSend.append("ConnectivityType", data.connectivityType);
    formDataToSend.append("SupportedOS", data.supportedOS);
    formDataToSend.append("WarrantyMonths", String(data.warrantyMonths));

    if (data.imageFile) {
      formDataToSend.append("ImageFile", data.imageFile);
    }

    await api.put(`/api/Products/${id}`, formDataToSend);
  },
  onSuccess: () => {
    navigate("/seller/products");
  },
});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["stock", "price", "categoryId", "ergonomyLevel", "warrantyMonths"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate({ ...formData, imageFile });
  };

  const ergonomyLabels = ["Düşük", "Orta", "Yüksek"];

  if (productLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar></Navbar>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ürün Düzenle</h1>
          <p className="text-slate-600">Ürün bilgilerini güncelleyin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Ürün Görseli</label>
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
                        setImagePreview(product?.imageUrl || null);
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
                  <p className="mt-2 text-sm text-slate-500">Yeni görsel seçmezseniz mevcut görsel korunur</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-2">
                Ürün Adı *
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
                Kategori *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value={0}>Kategori Seçin</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                  Fiyat (₺) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                  Stok Adedi *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Ürün Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>

            <div>
              <label htmlFor="ergonomyLevel" className="block text-sm font-medium text-slate-700 mb-2">
                Ergonomi Seviyesi
              </label>
              <select
                id="ergonomyLevel"
                name="ergonomyLevel"
                value={formData.ergonomyLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {ergonomyLabels.map((label, index) => (
                  <option key={index} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="connectivityType" className="block text-sm font-medium text-slate-700 mb-2">
                  Bağlantı Tipi
                </label>
                <input
                  id="connectivityType"
                  name="connectivityType"
                  type="text"
                  value={formData.connectivityType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label htmlFor="supportedOS" className="block text-sm font-medium text-slate-700 mb-2">
                  Desteklenen İşletim Sistemleri
                </label>
                <input
                  id="supportedOS"
                  name="supportedOS"
                  type="text"
                  value={formData.supportedOS}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="warrantyMonths" className="block text-sm font-medium text-slate-700 mb-2">
                Garanti Süresi (Ay)
              </label>
              <input
                id="warrantyMonths"
                name="warrantyMonths"
                type="number"
                min="0"
                value={formData.warrantyMonths}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={updateProductMutation.isPending}
                className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProductMutation.isPending ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="px-8 py-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                İptal
              </button>
            </div>

            {updateProductMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
