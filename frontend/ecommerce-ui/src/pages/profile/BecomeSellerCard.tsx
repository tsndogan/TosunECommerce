import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import Navbar from "../../components/Navbar";

export default function BecomeSellerCard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [ShopName, setShopName] = useState("");
  const [Description, setDescription] = useState("");


  const becomeSellerMutation = useMutation({
  mutationFn: async (data: { ShopName: string; Description: string }) => {
    const res = await api.post("/api/profile/become-seller", data);
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setShowForm(false);
    setShopName("");
    setDescription("");
  },
  onError: (err: any) => {
    console.error("Become seller error:", err);

  console.error("=== FULL ERROR ===");
  console.error("Response data:", err.response?.data);
  console.error("Response status:", err.response?.status);

  },
});

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  becomeSellerMutation.mutate({
    ShopName,
    Description,
  });
};  

  if (showForm) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm border border-slate-700 p-8 text-white">
        <Navbar></Navbar>
        <h3 className="text-2xl font-bold mb-2">Satıcı Ol</h3>
        <p className="text-slate-300 mb-6">Mağazanızı oluşturun ve ürün satmaya başlayın</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium mb-2">
              Mağaza Adı
            </label>
            <input
              id="shopName"
              type="text"
              value={ShopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
              placeholder="Örn: Teknoloji Dünyası"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Mağaza Açıklaması
            </label>
            <textarea
              id="description"
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 resize-none"
              placeholder="Mağazanızı tanıtın..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={becomeSellerMutation.isPending}
              className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {becomeSellerMutation.isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition"
            >
              İptal
            </button>
          </div>

          {becomeSellerMutation.isError && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm">
              Bir hata oluştu. Lütfen tekrar deneyin.
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm border border-slate-700 p-8 text-white">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl">
            🏪
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Satıcı Olun</h3>
          <p className="text-slate-300 mb-6">
            Kendi mağazanızı açın, ürünlerinizi satın ve kazanmaya başlayın. Binlerce müşteriye ulaşın!
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kolay ürün yönetimi
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Geniş müşteri kitlesi
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Hızlı ödeme sistemi
            </li>
          </ul>

          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Hemen Başvur
          </button>
        </div>
      </div>
    </div>
  );
}
