import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import EcommerceHomepage from "./pages/home";
import Header from "./Components/Header";
import Layout from "./Components/Layout";
import Footer from "./Components/Footer";
import EcommerceLogin from "./pages/Login";
import CartPage from "./pages/Cart";
import ProductDetailPage from "./pages/ProductDetailPage";

function App() {
  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/" element={<EcommerceHomepage />} />
          <Route path="/login" element={<EcommerceLogin />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
