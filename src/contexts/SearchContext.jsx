import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [allProducts, setAllProducts] = useState([]);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Load all products from FakeStore API once
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        setAllProducts(data);
        console.log('Products loaded in context:', data.length); // Debug log
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      // Save to recent searches
      const newSearch = {
        query,
        timestamp: new Date().toISOString()
      };
      
      setRecentSearches(prev => {
        const filtered = prev.filter(item => 
          item.query.toLowerCase() !== query.toLowerCase()
        );
        return [newSearch, ...filtered].slice(0, 5);
      });

      console.log('Searching for:', query); // Debug log
      console.log('All products count:', allProducts.length); // Debug log
      
      // Filter products based on search query
      const filteredProducts = allProducts.filter(product => {
        const titleMatch = product.title?.toLowerCase().includes(query.toLowerCase());
        const descMatch = product.description?.toLowerCase().includes(query.toLowerCase());
        const categoryMatch = product.category?.toLowerCase().includes(query.toLowerCase());
        
        return titleMatch || descMatch || categoryMatch;
      });
      
      console.log('Filtered products:', filteredProducts.length); // Debug log
      setSearchResults(filteredProducts);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [allProducts]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setShowSearchResults(false);
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchQuery,
        isSearching,
        showSearchResults,
        recentSearches,
        allProducts,
        setSearchQuery,
        performSearch,
        clearSearch,
        clearRecentSearches,
        setShowSearchResults
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};