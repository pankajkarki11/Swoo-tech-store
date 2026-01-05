import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext";
import { SearchProvider } from "./contexts/SearchContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
        {" "}
        <App />
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
