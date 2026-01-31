import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/categories";
import Navbar from "../../components/Navbar";

export default function CategoriesPage() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isLoading) return <p>Kategoriler yükleniyor...</p>;
  if (error) return <p>Kategoriler yüklenemedi.</p>;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar></Navbar>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Kategoriler</h1>
          <p className="text-slate-600">Ürün kategorilerine göz atın ve keşfedin</p>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                to={`/products?categoryId=${category.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-900 transition"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-6xl group-hover:scale-110 transition-transform">
                    {category.icon || "📦"}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      {category.productCount || 0} Ürün
                    </span>
                    <span className="text-slate-900 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Kategori Bulunamadı</h3>
            <p className="text-slate-600">Şu anda görüntülenebilir kategori bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
