import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import Navbar from "../../components/Navbar";
import { useState } from "react";

type SellerProfileDto = {
  id: number;
  shopName: string;
  description?: string | null;
  status: "Pending" | "Approved" | "Rejected" | string;
}

type MeDto = {
  fullName?: string | null;
  email?: string | null;
  sellerProfile?: SellerProfileDto | null;
  orders?: any[];
}

export default function ProfilePage() {
  const { user, hasRole, updateRoles } = useAuth();
  const queryClient = useQueryClient();
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");

  const { data: profile, isLoading, isError } = useQuery<MeDto>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/api/profile/me");
      if (data?.sellerProfile?.status === "Approved" && !hasRole("Seller")) {
        try {
          const currentRoles = user?.roles ?? [];
          updateRoles([...currentRoles, "Seller"]);
        } catch (err) {
          console.warn("AuthContext güncellenirken hata oluştu:", err);
        }
      }
      return data;
    },
  });

  const becomeSellerMutation = useMutation({
    mutationFn: async (data: { shopName: string; description: string }) => {
      const res = await api.post("/api/profile/become-seller", data);
      return res.data;
    },
    onSuccess: async (msg) => {
      alert(typeof msg === "string" ? msg : "Başvuru alındı");
      setShopName("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError(err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Başvuru gönderilemedi");
    },
  });

  const handleBecomeSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !description.trim()) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }
    becomeSellerMutation.mutate({ shopName, description });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-red-600">Profil bilgileri alınamadı.</div>
        </div>
      </div>
    );
  }

  const sellerStatus = profile.sellerProfile?.status ?? null;
  const isSellerApproved = sellerStatus === "Approved";
  const isSellerPending = sellerStatus === "Pending";
  const isSellerRejected = sellerStatus === "Rejected";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Profilim</h1>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U"}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{profile?.fullName || user?.fullName}</h2>
                <p className="text-slate-600 mb-4">{profile?.email || user?.email}</p>

                <div className="flex gap-2">
                  {user?.roles?.map((role: string) => (
                    <span key={role} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!hasRole("Seller") && !hasRole("Admin") && !profile.sellerProfile && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Satıcı Ol</h3>
              <form onSubmit={handleBecomeSellerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mağaza Adı</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Mağazanızın adı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Mağazanız hakkında kısa bir açıklama"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={becomeSellerMutation.isPending}
                  className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {becomeSellerMutation.isPending ? "Gönderiliyor..." : "Başvur"}
                </button>
              </form>
            </div>
          )}

          {profile?.sellerProfile && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Satıcı Bilgileri</h3>
                {isSellerApproved ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    ✓ Onaylı
                  </span>
                ) : isSellerRejected ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    ✗ Reddedildi
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                    ⏳ Onay Bekliyor
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600">Mağaza Adı</label>
                  <div className="text-lg font-semibold text-slate-900">{profile.sellerProfile.shopName}</div>
                </div>

                <div>
                  <label className="text-sm text-slate-600">Açıklama</label>
                  <div className="text-slate-700">{profile.sellerProfile.description}</div>
                </div>

                {isSellerApproved && (
                  <Link
                    to="/seller/products/create"
                    className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
                  >
                    Ürün Ekle
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Siparişlerim</h3>
            
            {profile?.orders && profile.orders.length > 0 ? (
              <div className="space-y-4">
                {profile.orders.map((order: any) => (
                  <div key={order.id} className="border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-slate-600">Sipariş #{order.id}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900">{order.totalPrice.toFixed(2)} ₺</div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium mt-1">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">
                            {item.productName} x{item.quantity}
                          </span>
                          <span className="font-semibold text-slate-900">{item.lineTotal.toFixed(2)} ₺</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 text-4xl mb-3">📦</div>
                <p className="text-slate-600 mb-4">Henüz siparişiniz bulunmamaktadır</p>
                <Link
                  to="/products"
                  className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                  Alışverişe Başla
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function updateRoles(arg0: string[]) {
  throw new Error("Function not implemented.");
}
