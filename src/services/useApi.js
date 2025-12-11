// src/hooks/useApi.js
import { useState, useCallback, useRef } from "react";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestQueue = useRef(new Map());

  const request = useCallback(async (url, options = {}) => {
    // Check if this request is already in progress
    const requestKey = `${url}-${JSON.stringify(options)}`;
    if (requestQueue.current.has(requestKey)) {
      return requestQueue.current.get(requestKey);
    }

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
      const requestPromise = fetch(`https://fakestoreapi.com${url}`, {
        ...options,
        headers,
      });

      // Store the promise in the queue
      requestQueue.current.set(requestKey, requestPromise);

      const response = await requestPromise;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      // Remove from queue and update loading state
      requestQueue.current.delete(requestKey);
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
    getByCategory: (category) => request(`/products/category/${category}`),
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
    getUserCarts: (userId) => request(`/carts/user/${userId}`),
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
