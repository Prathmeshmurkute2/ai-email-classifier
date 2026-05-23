import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor to inject JWT token automatically in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartmail_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("smartmail_token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("smartmail_token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/profile");
          setUser(res.data.data);
        } catch (err) {
          console.error("Profile fetch error, logging out:", err.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: jwtToken, ...userData } = res.data.data;
      localStorage.setItem("smartmail_token", jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { token: jwtToken, ...userData } = res.data.data;
      localStorage.setItem("smartmail_token", jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const connectGoogle = useCallback(async () => {
    try {
      // Pass the userId in state so we can link Google credentials to this user
      const userIdParam = user?._id ? `?userId=${user._id}` : "";
      const res = await api.get(`/auth/google/url${userIdParam}`);
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url; // Redirect browser to Google Consent Screen
      }
    } catch (err) {
      console.error("Google Auth connection error:", err.message);
      alert("Failed to connect to Google OAuth. Please check your backend environment variables.");
    }
  }, [user]);

  const handleOAuthSuccess = useCallback((jwtToken, name, email) => {
    localStorage.setItem("smartmail_token", jwtToken);
    setToken(jwtToken);
    setUser({ name, email });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        connectGoogle,
        handleOAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
