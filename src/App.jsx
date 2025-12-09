import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Home";
import Layout from "./components/Layout";
import EcommerceLogin from "./pages/Login";
import CartPage from "./pages/Cart";
import ProductDetailPage from "./pages/ProductDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import AddProductPage from "./pages/AddProductPage";
import ProductsPage from "./pages/ProductPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Layout>
      <Toaster position="top-right" />
      <main>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<EcommerceLogin />} />
          <Route path="/addproduct" element={<AddProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/addedproduct" element={<ProductsPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
