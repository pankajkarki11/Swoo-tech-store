
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import useApi from "../services/AdminuseApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const api = useApi();
  const isInitializing = useRef(false);

  // Admin username patterns
  const ADMIN_USERNAME_PATTERNS = ["john"];

  // Check if username qualifies for admin
  const isAdminUsername = useCallback((username) => {
    if (!username) return false;
    const lowerUsername = username.toLowerCase();
    return ADMIN_USERNAME_PATTERNS.some(pattern => 
      lowerUsername.includes(pattern.toLowerCase())
    );
  }, []);

  
  useEffect(() => {
    if (isInitializing.current) return;

    const initializeAuth = async () => {
      isInitializing.current = true;
      
      try {
        const storedUser = localStorage.getItem("swmart_user");
        const storedToken = localStorage.getItem("swmart_token");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []); 

  
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");
    setUser(null);
    setToken(null);
  }, []);


  const login = useCallback(
    async (credentials) => {
      const { username, password } = credentials;

      try {
       
        const [authResponse, usersResponse] = await Promise.all([
          api.authAPI.login({ username, password }),
          api.userAPI.getAll(),
        ]);

        const apiToken = authResponse.data.token;
        const apiUser = usersResponse.data.find((u) => u.username === username);

        if (!apiUser) {
          throw new Error("User not found in API");
        }

        const isAdminUser = isAdminUsername(username);

    
        const userData = {
          id: apiUser.id,
          username: apiUser.username,
          email: apiUser.email,
          name: `${apiUser.name?.firstname || ""} ${apiUser.name?.lastname || ""}`.trim() || username,
          firstname: apiUser.name?.firstname || username,
          lastname: apiUser.name?.lastname || "",
          address: apiUser.address,
          phone: apiUser.phone,
          role: isAdminUser ? "admin" : "customer",
          isAdmin: isAdminUser,
        };

    
        localStorage.setItem("swmart_token", apiToken);
        localStorage.setItem("swmart_user", JSON.stringify(userData));

        setUser(userData);
        setToken(apiToken);

        return {
          success: true,
          user: userData,
          token: apiToken,
          isAdmin: isAdminUser,
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: error.message || "Login failed. Please try again.",
        };
      }
    },
    [api, isAdminUsername]
  );

  
  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  
  const updateUser = useCallback(
    (updatedData) => {
      if (!user) return { success: false, error: "No user logged in" };

      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("swmart_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    },
    [user]
  );


  const getAllCarts = useCallback(async () => {
    try {
      const { data } = await api.cartAPI.getAll();
      return { success: true, data };
    } catch (error) {
      console.error("Error getting all carts:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const getCartById = useCallback(async (cartId) => {
    try {
      const { data } = await api.cartAPI.getById(cartId);
      return { success: true, data };
    } catch (error) {
      console.error("Error getting cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

 
  const getUserCarts = useCallback(async (userId) => {
    try {
      const { data } = await api.cartAPI.getUserCarts(userId);
      return { success: true, data };
    } catch (error) {
      console.error("Error getting user carts:", error);
      return { success: false, error: error.message };
    }
  }, [api]);


  const createCart = useCallback(async (cartData) => {
    try {
      const { data } = await api.cartAPI.create(cartData);
      return { success: true, data };
    } catch (error) {
      console.error("Error creating cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);


  const updateCart = useCallback(async (cartId, cartData) => {
    try {
      const { data } = await api.cartAPI.update(cartId, cartData);
      return { success: true, data };
    } catch (error) {
      console.error("Error updating cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);


  const deleteCart = useCallback(async (cartId) => {
    try {
      const { data } = await api.cartAPI.delete(cartId);
      return { success: true, data };
    } catch (error) {
      console.error("Error deleting cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);


  const value = useMemo(
    () => ({
      // State
      user,
      token,
      loading,

      // Auth status
      isAuthenticated: !!user && !!token,
      isAdmin: user?.isAdmin || false,

      // Auth functions
      login,
      logout,
      updateUser,

      // FakeStore API Cart functions
      getAllCarts,
      getCartById,
      getUserCarts,
      createCart,
      updateCart,
      deleteCart,

      // Helpers
      isAdminUsername,
      ADMIN_USERNAME_PATTERNS,
    }),
    [
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      getAllCarts,
      getCartById,
      getUserCarts,
      createCart,
      updateCart,
      deleteCart,
      isAdminUsername,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};