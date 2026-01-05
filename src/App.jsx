import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NotFound from "./pages/admin/NotFound";
import NotFound404 from "./components_temp/NotFound404";

// Client Components
import LayoutClient from "./components_temp/LayoutClient";
import ClientLogin from "./pages/client/ClientLogin";
import HomePage from "./pages/client/Home";
import CartPage from "./pages/client/Cart";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import UserProfilePage from "./pages/client/UserProfilePage";
import AddProductPage from "./pages/client/AddProductPage";
import ProductsPage from "./pages/client/ProductPage";
import CheckoutPage from "./pages/client/CheckoutPage";

import SearchResults from "./pages/client/SearchResult";

// Admin Components
import LayoutAdmin from "./components_temp/LayoutAdmin";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductDetails from "./pages/admin/ProductDetails";
import Carts from "./pages/admin/Carts";
import CartDetails from "./pages/admin/CartDetails";
import UsersPage from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";

// Protected Route Components
import ProtectedRoute from "./components_temp/ProtectedRoute";
import PublicOnlyRoute from "./components_temp/PublicOnlyRoute";
import Button from "./components_temp/ui/Button";
import AccessDenied from "./pages/AccessDenied";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 1000,
            iconTheme: {
              primary: "#01A49E",
              secondary: "#fff",
            },
          },
          error: {
            duration: 1000,
            iconTheme: {
              primary: "#ff4d4d",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        <Route element={<LayoutClient />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/search" element={<SearchResults />} />
         
          <Route path="/checkout" element={<CheckoutPage />} />
        


          {/* Protected Routes (Require Login) */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addproduct"
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addedproduct"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute redirectTo="/">
                <ClientLogin />
              </PublicOnlyRoute>
            }
          />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="carts" element={<Carts />} />
          <Route path="carts/:id" element={<CartDetails />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="delete" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        <Route path="/unauthorized" element={<AccessDenied />} />

        <Route path="*" element={<NotFound404/>} />
      </Routes>
    </>
  );
}

export default App;
