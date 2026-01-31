import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import Navbar from "../../components/Navbar";
import { getProduct } from "../../api/products";
import { addToCart } from "../../api/cart";
import { ProductDto } from "../../types/products";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthentication } = useAuth();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const productId = Number(id);

enum ErgonomyLevel {
  Low = 0,
  Medium = 1,
  High = 2,
}

const ergonomyLabels: Record<ErgonomyLevel, string> = {
  [ErgonomyLevel.Low]: "Düşük",
  [ErgonomyLevel.Medium]: "Orta",
  [ErgonomyLevel.High]: "Yüksek",
};

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<ProductDto>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const products = await getProduct(productId);
      return products;
    },
    enabled: Number.isFinite(productId),
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addToCart(productId, quantity),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleAddToCart = () => {
    if (!isAuthentication) {
      navigate("/login");
      return;
    }

    addToCartMutation.mutate({
      productId,
      quantity,
    });
  };

  const ergonomyColors = [
    "bg-red-100 text-red-700",
    "bg-yellow-100 text-yellow-700",
    "bg-green-100 text-green-700",
  ];
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-slate-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-32 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ürün Bulunamadı</h2>
          <p className="text-slate-600 mb-4">Aradığınız ürün mevcut değil.</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✓ Ürün sepete eklendi!
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link to="/products" className="hover:text-slate-900">Ürünler</Link>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
              <img
                src={product.imageUrl || "https://via.placeholder.com/600"}
                alt={product.name ?? ""}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>

                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {product.categoryName && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                      {product.categoryName}
                    </span>
                  )}
                  {product.brandName && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                      {product.brandName}
                    </span>
                  )}
                  {product.ergonomyLevel !== undefined && product.ergonomyLevel !== null && (
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${ergonomyColors[product.ergonomyLevel as unknown as number]}`}>
                      Ergonomi: {ergonomyLabels[product.ergonomyLevel as unknown as ErgonomyLevel]}
                    </span>
                  )}
                </div>

                <div className="text-4xl font-bold text-slate-900 mb-6">{product?.price !== undefined ? product.price.toFixed(2) : "0.00"} ₺</div>

                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Ürün Açıklaması</h2>
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                  {product.connectivityType && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Bağlantı</div>
                      <div className="font-semibold text-slate-900">{product.connectivityType}</div>
                    </div>
                  )}
                  {product.supportedOS && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Desteklenen OS</div>
                      <div className="font-semibold text-slate-900">{product.supportedOS}</div>
                    </div>
                  )}
                  {product.warrantyMonths !== undefined && product.warrantyMonths !== null && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Garanti</div>
                      <div className="font-semibold text-slate-900">{product.warrantyMonths} Ay</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Stok Durumu</div>
                    <div className="font-semibold text-slate-900">
                      {product.stock > 0 ? `${product.stock} Adet` : "Stokta Yok"}
                    </div>
                  </div>
                </div>

                {product.sellerShopName && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">Satıcı</div>
                    <div className="font-semibold text-slate-900">{product.sellerShopName}</div>
                  </div>
                )}
              </div>

              {product.stock > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium text-slate-700">Adet:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                        className="w-20 text-center border border-slate-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        min="1"
                        max={product.stock}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addToCartMutation.isPending ? "Ekleniyor..." : "Sepete Ekle"}
                  </button>
                </div>
              )}

              {product.stock === 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center font-medium">
                    Bu ürün şu anda stokta bulunmamaktadır
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
