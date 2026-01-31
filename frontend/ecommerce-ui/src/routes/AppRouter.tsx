import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ProductListPage from "../pages/products/ProductListPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SellerRoute from "../auth/SellerRoute";
import SellerCreateProductPage from "../pages/profile/SellerCreateProductPage";
import SellerEditProductPage from "../pages/profile/SellerEditProductPage"; 
import SellerMyProductsPage from "../pages/profile/SellerMyProductsPage"; 
import Brands from "../pages/brands/Brands"; 
import Categories from "../pages/categories/Categories"; 
import Sellers from "../pages/sellers/Sellers"; 
import ProfilePage from "../pages/profile/ProfilePage";
import CartPage from "../pages/cart/CartPage";
import AdminSellerPage from "../pages/admin/AdminSellerPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminRoute from "../auth/AdminRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          

            <Route
            path="/seller/products/create"
            element={
                <SellerRoute>
                <SellerCreateProductPage />
                </SellerRoute>
            }
            />
            <Route
            path="/seller/products"
            element={
                <SellerRoute>
                <SellerMyProductsPage />
                </SellerRoute>
            }
            />
            <Route
            path="/seller/products/edit/:id"
            element={
                <SellerRoute>
                <SellerEditProductPage />
                </SellerRoute>
            }
            />

            <Route
            path="/admin/sellers"
            element={
                <AdminRoute>
                <AdminSellerPage />
                </AdminRoute>
            }
            />

            <Route
            path="/admin/dashboard"
            element={
                <AdminRoute>
                <AdminDashboardPage />
                </AdminRoute>
            }
            />

        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}