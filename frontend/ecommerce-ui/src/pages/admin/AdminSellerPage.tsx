import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingSellers, approveSeller } from "../../../src/api/admin";
import type { PendingSellerDto } from "../../../src/api/admin";
import Navbar from "../../components/Navbar";

export default function AdminSellerPage() {
  const queryClient = useQueryClient();

  const {
    data: sellers,
    isLoading,
    isError,
  } = useQuery<PendingSellerDto[]>({
    queryKey: ["pending-sellers"],
    queryFn: getPendingSellers,
  });

  const approveMutation = useMutation({
    mutationFn: approveSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-sellers"] });
    },
  });

  const handleApprove = (id: number) => {
    if (confirm("Bu satıcıyı onaylamak istediğinizden emin misiniz?")) {
      approveMutation.mutate(id);
    }
  };

  if (isLoading) return <p>Yükleniyor...</p>;
  if (isError) return <p>Satıcılar yüklenirken hata oluştu.</p>;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar></Navbar>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Satıcı Başvuruları</h1>
          <p className="text-slate-600">Bekleyen satıcı başvurularını onaylayın</p>
        </div>

        {sellers && sellers.length > 0 ? (
          <div className="space-y-6">
            {sellers.map((seller: any) => (
              <div
                key={seller.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                          {seller.shopName?.[0]?.toUpperCase() || "S"}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{seller.shopName}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">Kullanıcı:</span>
                            <span>{seller.userFullName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">E-posta:</span>
                            <span>{seller.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">Başvuru Tarihi:</span>
                            <span>{new Date(seller.createdAt).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-700 mb-2">Mağaza Açıklaması</div>
                          <p className="text-slate-600">{seller.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleApprove(seller.id)}
                        disabled={approveMutation.isPending}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        ✓ Onayla
                      </button>
                    </div>
                  </div>
                </div>

                {seller.isApproved && (
                  <div className="bg-green-50 border-t border-green-200 px-6 py-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Bu satıcı onaylandı</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Başvuru Bulunmuyor</h3>
            <p className="text-slate-600">Şu anda bekleyen satıcı başvurusu bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
