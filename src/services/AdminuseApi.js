// src/hooks/useApi.js
import { useState, useCallback } from "react";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("swmart_token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`https://fakestoreapi.com${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        
        throw new Error(
        `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (err) {
      console.error("API Request Error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Products API
  const productAPI = {
    getAll: () => request("/products"),
    getById: (id) => request(`/products/${id}`),
    create: (product) =>
      request("/products", {
        method: "POST",
        body: JSON.stringify(product),
      }),
    update: (id, product) =>
      request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product),
      }),
    delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
    getCategories: () => request("/products/categories"),
    getByCategory: (category) =>
      request(`/products/category/${category}`),
    getLimited: (limit = 10) =>
      request(`/products?limit=${limit}`),
  };

  // Carts API
  const cartAPI = {
    getAll: () => request("/carts"),
    getById: (id) => request(`/carts/${id}`),
    create: (cart) =>
      request("/carts", {
        method: "POST",
        body: JSON.stringify(cart),
      }),
    update: (id, cart) =>
      request(`/carts/${id}`, {
        method: "PUT",
        body: JSON.stringify(cart),
      }),
    delete: (id) => request(`/carts/${id}`, { method: "DELETE" }),
    getUserCarts: (userId) =>
      request(`/carts/user/${userId}`),
    getUserCart: (userId) =>
      request(`/carts/user/${userId}`).then(
        (res) => res.data[0]
      ),
  };

  // Users API
  const userAPI = {
    getAll: () => request("/users"),
    getById: (id) => request(`/users/${id}`),
    create: (user) =>
      request("/users", {
        method: "POST",
        body: JSON.stringify(user),
      }),
    update: (id, user) =>
      request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      }),
    delete: (id) => request(`/users/${id}`, { method: "DELETE" }),
  };

  // Auth API
  const authAPI = {
    login: (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
  };

  return {
    loading,
    error,
    request,
    productAPI,
    cartAPI,
    userAPI,
    authAPI,
  };
};

export default useApi;