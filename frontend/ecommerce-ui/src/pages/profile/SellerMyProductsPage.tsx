import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function SellerMyProductsPage() {
  console.log("SellerCreateProductPage RENDER OLDU!");
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
  queryKey: ["my-products"],
  queryFn: async () => {
    const { data } = await api.get("/api/Products/my");
    return data;
  },
});

  const deleteProductMutation = useMutation({
  mutationFn: async (id: number) => {
    await api.delete(`/api/Products/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["my-products"] });
  },
});

  const handleDelete = (id: number, name: string) => {
    if (confirm(`"${name}" ürününü silmek istediğinizden emin misiniz?`)) {
      deleteProductMutation.mutate(id);
    }
  };

  const ergonomyLabels = ["Düşük", "Orta", "Yüksek"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Ürünlerim</h1>
            <p className="text-slate-600">Mağazanızdaki ürünleri yönetin</p>
          </div>
          <Link
            to="/seller/products/create"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
          >
            + Yeni Ürün Ekle
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                          <div className="flex items-center gap-3 mb-2">
                            {product.categoryName && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                                {product.categoryName}
                              </span>
                            )}
                            {product.brandName && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                                {product.brandName}
                              </span>
                            )}
                            {product.ergonomyLevel !== undefined && product.ergonomyLevel !== null && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                Ergonomi: {ergonomyLabels[product.ergonomyLevel]}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900 mb-1">
                            {product.price?.toFixed(2)} ₺
                          </div>
                          <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Stok: {product.stock}
                          </div>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        {product.connectivityType && (
                          <div>
                            <span className="text-slate-600">Bağlantı: </span>
                            <span className="font-medium text-slate-900">{product.connectivityType}</span>
                          </div>
                        )}
                        {product.supportedOS && (
                          <div>
                            <span className="text-slate-600">OS: </span>
                            <span className="font-medium text-slate-900">{product.supportedOS}</span>
                          </div>
                        )}
                        {product.warrantyMonths !== undefined && (
                          <div>
                            <span className="text-slate-600">Garanti: </span>
                            <span className="font-medium text-slate-900">{product.warrantyMonths} Ay</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/products/${product.id}`}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                        >
                          Görüntüle
                        </Link>
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteProductMutation.isPending}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Henüz Ürün Eklemediniz</h3>
            <p className="text-slate-600 mb-6">Mağazanıza ilk ürününüzü ekleyerek başlayın</p>
            <Link
              to="/seller/products/create"
              className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              İlk Ürünü Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
