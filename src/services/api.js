// src/services/api.js

const BASE_URL = "https://fakestoreapi.com";

export const fetchProducts = async (limit = 20, sort = "desc") => {
  try {
    const response = await fetch(
      `${BASE_URL}/products?sort=${sort}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products/categories`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const fetchProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/products/category/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} products`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${category} products:`, error);
    return [];
  }
};

export const fetchProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
