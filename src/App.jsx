import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "react-hot-toast";

// Client Components
import LayoutClient from "./components/LayoutClient";
import ClientLogin from "./pages/client/ClientLogin";
import HomePage from "./pages/client/Home";
import CartPage from "./pages/client/Cart";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import UserProfilePage from "./pages/client/UserProfilePage";
import AddProductPage from "./pages/client/AddProductPage";
import ProductsPage from "./pages/client/ProductPage";

// Admin Components
import LayoutAdmin from "./components/LayoutAdmin";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductDetails from "./pages/admin/ProductDetails";
import Carts from "./pages/admin/Carts";
import CartDetails from "./pages/admin/CartDetails";
import UsersPage from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";

// Protected Route Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#01A49E",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
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

            {/* Protected Routes (Require Login) */}
            <Route
              path="/cart"
              element={
                
                  <CartPage />
           
              }
            />
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
          </Route>

       
          <Route
            path="/admin"
            element={<Navigate to="/admin/login" replace />}
          />

        
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                  <div className="text-red-500 text-6xl mb-4">403</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Access Denied
                  </h1>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                    {window.location.pathname.includes("/admin") &&
                      " Please login with admin credentials."}
                  </p>
                  <div className="space-y-3">
                    {window.location.pathname.includes("/admin") ? (
                      <a
                        href="/admin/login"
                        className="block w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Go to Admin Login
                      </a>
                    ) : (
                      <button
                        onClick={() => window.history.back()}
                        className="w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Go Back
                      </button>
                    )}
                    <a
                      href="/"
                      className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Go to Homepage
                    </a>
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                  <div className="text-gray-800 text-6xl mb-4">404</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="/"
                      className="block w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Go to Homepage
                    </a>
                    <a
                      href="/admin/login"
                      className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Go to Admin Login
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
