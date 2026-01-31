import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getProducts, getProductsWith } from "../../api/products";
import { api } from "../../api/client";
import type { ProductDto } from "../../types/products";

export default function ProductListPage() {

  enum ErgonomyLevel {
  Low = 0,
  Medium = 1,
  High = 2,
}
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const sellerId = searchParams.get("sellerId");

  const { data: products, isLoading } = useQuery<ProductDto[]>({
  queryKey: ["products", categoryId, brandId, sellerId, sortBy],
  queryFn: () =>
    getProductsWith({
      categoryId,
      brandId,
      sellerId,
      sortBy,
    }),
});

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/api/categories")).data,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/api/brands")).data,
  });

  const { data: sellers } = useQuery({
    queryKey: ["sellers"],
    queryFn: async () => (await api.get("/api/sellers")).data,
  });

 const updateParam = (key: string, value?: string) => {
  const newParams = new URLSearchParams(searchParams);

  if (value) newParams.set(key, value);
  else newParams.delete(key);

  setSearchParams(newParams);
};


  const clearFilters = () => {
    setSearchParams({});
    setSortBy("");
  };

  const ergonomyLabels: Record<ErgonomyLevel, string> = {
    [ErgonomyLevel.Low]: "Düşük",
    [ErgonomyLevel.Medium]: "Orta",
    [ErgonomyLevel.High]: "Yüksek",
  };
  const handleCategoryChange = (value: string) => {
  updateParam("categoryId", value || undefined);
};
  const handleBrandChange = (value: string) => {
  updateParam("brandId", value || undefined);
};
  const handleSellerChange = (value: string) => {
  updateParam("sellerId", value || undefined);
};
  const handleSortChange = (value: string) => {
  setSortBy(value);

  if (value) {
    searchParams.set("sortBy", value);
  } else {
    searchParams.delete("sortBy");
  }

  setSearchParams(searchParams);
};



  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          Ürünler
        </h1>
        <p className="text-slate-600 text-lg">
          İhtiyacına en uygun ürünü keşfet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <aside className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Filtreler</h2>
              {(categoryId || brandId || sortBy) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-red-500 hover:text-red-600 transition"
                >
                  Temizle
                </button>
              )}
            </div>

            <div className="space-y-6">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kategori
                </label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Marka
                </label>
                <select
                  value={brandId || ""}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">Tüm Markalar</option>
                  {brands?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Satıcı
                </label>
                <select
                  value={sellerId || ""}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">Tüm Satıcılar</option>
                  {sellers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sıralama
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">Varsayılan</option>
                  <option value="price_asc">Fiyat ↑</option>
                  <option value="price_desc">Fiyat ↓</option>
                  <option value="name_asc">A–Z</option>
                  <option value="name_desc">Z–A</option>
                </select>
              </div>

            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="aspect-square rounded-xl bg-slate-200 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >

                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-slate-700">
                      {product.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.categoryName && (
                        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          {product.categoryName}
                        </span>
                      )}
                      {product.brandName && (
                        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          {product.brandName}
                        </span>
                      )}
                    </div>

                    {product.sellerShopName && (
                      <p className="text-xs text-slate-500 mb-2">
                        Satıcı: <span className="font-medium">{product.sellerShopName}</span>
                      </p>
                    )}

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-2xl font-extrabold text-slate-900">
                          {product.price.toFixed(2)} ₺
                        </p>
                        <p className="text-xs text-slate-500">
                          Stok: {product.stock}
                        </p>
                      </div>

                      <span className="rounded-xl bg-slate-900 text-white text-xs px-4 py-2 opacity-0 group-hover:opacity-100 transition">
                        İncele →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Ürün Bulunamadı
              </h3>
              <p className="text-slate-600 mb-6">
                Seçilen filtrelere uygun ürün yok
              </p>
              <button
                onClick={clearFilters}
                className="rounded-xl bg-slate-900 px-8 py-3 text-white font-medium hover:bg-slate-800 transition"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}

        </section>
      </div>
    </div>
  </div>
);

}
