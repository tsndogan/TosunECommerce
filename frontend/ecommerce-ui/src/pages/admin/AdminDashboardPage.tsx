import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../src/api/client";

type CategoryForm = {
  name: string;
  description: string;
};

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "categories">("overview");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryForm>({
    name: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // GET /api/admincategory
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/api/admincategory");
      return res.data;
    },
  });

  const { data: pendingSellers = [] } = useQuery({
    queryKey: ["pending-sellers"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/Admin/pending-sellers");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // POST /api/admincategory
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const res = await api.post("/api/admincategory", {
        name: data.name,
        description: data.description || null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowCategoryForm(false);
      setCategoryFormData({ name: "", description: "" });
      setErrorMessage("");
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.response?.data || "Kategori eklenemedi");
    },
  });

  // PUT /api/admincategory/{id}
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryForm }) => {
      const res = await api.put(`/api/admincategory/${id}`, {
        name: data.name,
        description: data.description || null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setShowCategoryForm(false);
      setCategoryFormData({ name: "", description: "" });
      setErrorMessage("");
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.response?.data || "Kategori güncellenemedi");
    },
  });

  // DELETE /api/admincategory/{id}
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admincategory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setErrorMessage("");
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || "Kategori silinemedi");
    },
  });

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!categoryFormData.name.trim()) {
      setErrorMessage("Kategori adı boş olamaz");
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: categoryFormData,
      });
    } else {
      createCategoryMutation.mutate(categoryFormData);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description ?? "",
    });
    setShowCategoryForm(true);
    setErrorMessage("");
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({ name: "", description: "" });
    setErrorMessage("");
  };

  const stats = [
    {
      title: "Bekleyen Başvuru",
      value: pendingSellers?.length || 0,
      icon: "⏳",
    },
    {
      title: "Toplam Kategori",
      value: categories?.length || 0,
      icon: "🏷️",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Paneli</h1>
          <p className="text-slate-600">Sistemin genel durumunu buradan takip edebilirsiniz</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
              </div>
              <div className="text-sm font-medium opacity-90">{stat.title}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === "overview"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === "categories"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Kategori Yönetimi
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Hızlı Erişim</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    to="/products"
                    className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Ürünler</div>
                      <div className="text-sm text-slate-600">Tüm ürünleri görüntüle</div>
                    </div>
                  </Link>

                  <Link
                    to="/categories"
                    className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                      🏷️
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Kategoriler</div>
                      <div className="text-sm text-slate-600">{categories?.length || 0} kategori</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Kategori Yönetimi</h2>
                  {!showCategoryForm && (
                    <button
                      onClick={() => setShowCategoryForm(true)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                    >
                      + Yeni Kategori
                    </button>
                  )}
                </div>

                {showCategoryForm && (
                  <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
                    </h3>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                          Kategori Adı *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="Örn: Mouse, Klavye"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                          Açıklama (Opsiyonel)
                        </label>
                        <textarea
                          id="description"
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                          placeholder="Kategori açıklaması (opsiyonel)"
                        />
                      </div>

                      {errorMessage && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                          ⚠️ {errorMessage}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium disabled:opacity-50"
                        >
                          {editingCategory ? "Güncelle" : "Ekle"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelCategoryForm}
                          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {categoriesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="space-y-3">
                    {categories.map((category: any) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 mb-1">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-slate-600">{category.description}</div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            {category.productCount || 0} ürün
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={deleteCategoryMutation.isPending}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-600">
                    Henüz kategori eklenmemiş
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}