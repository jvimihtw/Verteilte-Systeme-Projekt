import { createContext, useContext, useState } from "react";
import { login as apiLogin } from "../api/client"; // Changed: Imported real API client instead of mock data

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Changed: Initialize user state from localStorage to persist login across page refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Added: Track token state with localStorage persistence
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Changed: Converted to an async function calling the actual backend login endpoint
  const loginUser = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      
      // Added: Save token and user info to localStorage upon successful login
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      // Added: Return structured error details for UI feedback
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  // Changed: Clear localStorage items when logging out
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}