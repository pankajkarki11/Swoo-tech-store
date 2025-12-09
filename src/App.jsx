import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/home";
import Layout from "./components/Layout";
import EcommerceLogin from "./pages/Login";
import CartPage from "./pages/Cart";
import ProductDetailPage from "./pages/ProductDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import AddProductPage from "./pages/AddProductPage";
import ProductsPage from "./pages/ProductPage";

function App() {
  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<EcommerceLogin />} />
          <Route path="/addproduct" element={<AddProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/addedproduct" element={<ProductsPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/Profile" element={<UserProfilePage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
