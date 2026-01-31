import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [FullName, setFullName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data: { FullName: string; Email: string; Password: string }) => {
      const response = await fetch("/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kayıt başarısız");
      return response.json();
    },
    onSuccess: (data) => {
      navigate("/login");
    },
    onError: (err: any) => {
      setError(err.message || "Kayıt başarısız");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
          Password.length < 12 ||
          !/[A-Z]/.test(Password) ||
          !/[a-z]/.test(Password) ||
          !/[0-9]/.test(Password) ||
          !/[^A-Za-z0-9]/.test(Password)
        ) {
          setError("Şifre en az 12 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir");
          return;
}
    registerMutation.mutate({ FullName, Email, Password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white text-2xl font-bold mb-4">
            E
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hesap Oluşturun</h1>
          <p className="text-slate-600">Alışverişe başlamak için kayıt olun</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                value={FullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Zaten hesabınız var mı?{" "}
              <Link to="/login" className="text-slate-900 font-semibold hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
