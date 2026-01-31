import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Sellers(){
const { data: sellers, isLoading } = useQuery({
  queryKey: ["sellers"],
  queryFn: async () => {
    const { data } = await api.get("/api/sellers");
    return data;
  },
});
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl" />
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Satıcılar</h1>
          <p className="text-slate-600">Güvenilir satıcılarımızdan alışveriş yapın</p>
        </div>

        {sellers && sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller: any) => (
              <Link
                key={seller.id}
                to={`/products?sellerId=${seller.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-900 transition"
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-white text-2xl font-bold group-hover:bg-white/20 transition">
                      {seller.shopName?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{seller.shopName}</h3>
                      {seller.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-300">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Doğrulanmış
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <div>
                      <span className="font-semibold text-white">{seller.productCount || 0}</span> Ürün
                    </div>
                    {seller.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="font-semibold text-white">{seller.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    {seller.description || "Satıcı açıklaması bulunmamaktadır."}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Üye: {new Date(seller.createdAt).getFullYear()}
                    </span>
                    <span className="text-slate-900 font-medium group-hover:translate-x-1 transition-transform">
                      Ürünleri Gör →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Satıcı Bulunamadı</h3>
            <p className="text-slate-600">Şu anda görüntülenebilir satıcı bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
