// src/hooks/useApi.js
import { useState, useCallback, useRef } from "react";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestQueue = useRef(new Map());
  const cache = useRef(new Map());
  const CACHE_DURATION = 30000; // 30 seconds

  const request = useCallback(async (url, options = {}, skipCache = false) => {
    const requestKey = `${url}-${JSON.stringify(options)}`;

    // Check cache first (unless skipping)
    if (!skipCache && cache.current.has(requestKey)) {
      const cached = cache.current.get(requestKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return Promise.resolve(cached.data);
      }
      cache.current.delete(requestKey);
    }

    // Check if request is already in progress
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

      // Store promise in queue
      requestQueue.current.set(requestKey, requestPromise);

      const response = await requestPromise;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const result = {
        data,
        status: response.status,
        headers: response.headers,
      };

      // Cache successful responses
      if (!skipCache && options.method?.toUpperCase() === "GET") {
        cache.current.set(requestKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (err) {
      console.error("API Request Error:", err);
      setError(err.message);
      throw err;
    } finally {
      // Remove from queue
      requestQueue.current.delete(requestKey);
      setLoading(false);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Clear cache for specific URL
  const clearCacheForUrl = useCallback((url) => {
    const keysToDelete = [];
    for (const key of cache.current.keys()) {
      if (key.startsWith(url)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => cache.current.delete(key));
  }, []);

  // Products API
  const productAPI = {
    getAll: (skipCache = false) => request("/products", {}, skipCache),
    getById: (id, skipCache = false) =>
      request(`/products/${id}`, {}, skipCache),
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
    getCategories: (skipCache = false) =>
      request("/products/categories", {}, skipCache),
    getByCategory: (category, skipCache = false) =>
      request(`/products/category/${category}`, {}, skipCache),
    getLimited: (limit = 10, skipCache = false) =>
      request(`/products?limit=${limit}`, {}, skipCache),
  };

  // Carts API
  const cartAPI = {
    getAll: (skipCache = false) => request("/carts", {}, skipCache),
    getById: (id, skipCache = false) => request(`/carts/${id}`, {}, skipCache),
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
    getUserCarts: (userId, skipCache = false) =>
      request(`/carts/user/${userId}`, {}, skipCache),
    getUserCart: (userId, skipCache = false) =>
      request(`/carts/user/${userId}`, {}, skipCache).then(
        (res) => res.data[0]
      ),
  };

  // Users API
  const userAPI = {
    getAll: (skipCache = false) => request("/users", {}, skipCache),
    getById: (id, skipCache = false) => request(`/users/${id}`, {}, skipCache),
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
    clearCache,
    clearCacheForUrl,
    productAPI,
    cartAPI,
    userAPI,
    authAPI,
  };
};

export default useApi;
