import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getBrands } from "../../api/brands";
import Navbar from "../../components/Navbar";

export default function BrandsPage() {
  const {
    data: brands,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  if (isLoading) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Markalar yüklenemedi</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Markalar</h1>
          <p className="text-slate-600">Favori markalarınızın ürünlerini keşfedin</p>
        </div>

        {brands && brands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                to={`/products?brandId=${brand.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-900 transition flex flex-col items-center justify-center"
              >
                <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-slate-300 group-hover:text-slate-400 transition">
                      {brand.name?.[0]?.toUpperCase() || "B"}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-center mb-2 group-hover:text-slate-700">
                  {brand.name}
                </h3>

                <div className="text-xs text-slate-600">
                  {brand.productCount || 0} Ürün
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Marka Bulunamadı</h3>
            <p className="text-slate-600">Şu anda görüntülenebilir marka bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
