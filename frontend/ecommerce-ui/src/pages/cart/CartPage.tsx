import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getMyCart,
  removeFromCart,
  checkout,
} from "../../api/cart";
import Navbar from "../../components/Navbar";

export default function CartPage() {
  const queryClient = useQueryClient();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getMyCart,
  });

  const removeMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity?: number;
    }) => removeFromCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setCheckoutSuccess(true);
    },
  });

  const handleRemoveItem = (productId: number, quantity?: number) => {
    removeMutation.mutate({ productId, quantity });
  };

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Sipariş Alındı!</h2>
          <p className="text-slate-600 mb-8">Siparişiniz başarıyla oluşturuldu. Teşekkür ederiz!</p>
          <div className="space-y-3">
            <Link to="/products" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
              Alışverişe Devam Et
            </Link>
            <Link to="/profile" className="block w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
              Profilime Git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-slate-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-slate-600 mb-6">Alışverişe başlamak için ürünleri keşfedin</p>
          <Link to="/products" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition">
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-200">
              {cart.items.map((item: any) => (
                <div key={item.productId} className="p-6">
                  <div className="flex gap-4">
                    <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/150"}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-lg font-semibold text-slate-900 hover:text-slate-700 mb-2 block"
                      >
                        {item.productName}
                      </Link>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-slate-600">
                          Birim Fiyat: <span className="font-semibold text-slate-900">{item.unitPrice.toFixed(2)} ₺</span>
                        </div>
                        <div className="text-slate-600">
                          Adet: <span className="font-semibold text-slate-900">{item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-slate-900">{item.lineTotal.toFixed(2)} ₺</div>
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.quantity)}
                          disabled={removeMutation.isPending}
                          className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Sipariş Özeti</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Ürünler ({cart.items.length})</span>
                  <span>{cart.totalPrice.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kargo</span>
                  <span className="text-green-600 font-medium">Ücretsiz</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Toplam</span>
                  <span className="text-2xl font-bold text-slate-900">{cart.totalPrice.toFixed(2)} ₺</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? "İşleniyor..." : "Siparişi Tamamla"}
              </button>

              <Link to="/products" className="block text-center mt-4 text-slate-600 hover:text-slate-900 text-sm">
                ← Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
