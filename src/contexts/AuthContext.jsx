// src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage on initial load
    const storedUser = localStorage.getItem("swmart_user");
    const storedToken = localStorage.getItem("swmart_token");

    if (storedUser && storedToken) {
      try {
        const parsedData = JSON.parse(storedUser);
        setUser(parsedData);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear corrupted data
        localStorage.removeItem("swmart_user");
        localStorage.removeItem("swmart_token");
      }
    }

    setLoading(false);
  }, []);

  // FakeStoreAPI login
  const login = async (usernameInput, password) => {
    try {
      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const token = data.token;

      // Get user data from users endpoint
      const usersResponse = await fetch("https://fakestoreapi.com/users");
      const users = await usersResponse.json();

      // Find user by username
      const userData = users.find((u) => u.username === usernameInput) || {
        id: Math.floor(Math.random() * 1000) + 1,
        email: `${usernameInput}@example.com`,
        username: usernameInput,
        name: {
          firstname:
            usernameInput.charAt(0).toUpperCase() + usernameInput.slice(1),
          lastname: "User",
        },
      };

      // Format user data
      const formattedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: `${userData.name?.firstname || userData.username} ${
          userData.name?.lastname || ""
        }`.trim(),
        firstname: userData.name?.firstname || userData.username,
        lastname: userData.name?.lastname || "",
      };

      // Store in state and localStorage
      setUser(formattedUser);
      setToken(token);
      localStorage.setItem("swmart_user", JSON.stringify(formattedUser));
      localStorage.setItem("swmart_token", token);

      return { success: true, user: formattedUser };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
