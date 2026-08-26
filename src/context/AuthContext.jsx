"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  clearStoredToken,
  getStoredToken,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        console.debug("[auth] Authentication restore skipped", { jwtExists: false });
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await fetchCurrentUser(token);
      setUser(userData);
    } catch (err) {
      console.error("[auth] Authentication restore failed:", {
        status: err.status,
        authInvalid: err.authInvalid,
        message: err.message,
      });
      if (err.authInvalid) {
        setUser(null);
        console.warn("[auth] Logout triggered: refresh token was rejected or expired.");
        clearStoredToken();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async ({ identifier, password }) => {
    const authData = await loginUser({ identifier, password });
    // Refetch to ensure image and role are fully populated
    try {
      const fullUser = await fetchCurrentUser(authData.jwt);
      setUser(fullUser || authData.user);
    } catch {
      setUser(authData.user);
    }
    return authData;
  };

  const register = async (payload) => {
    const authData = await registerUser(payload);
    try {
      const fullUser = await fetchCurrentUser(authData.jwt);
      setUser(fullUser || authData.user);
    } catch {
      setUser(authData.user);
    }
    return authData;
  };

  const logout = () => {
    console.debug("[auth] Logout triggered: user action");
    clearStoredToken();
    setUser(null);
  };

  const role = user?.role?.type || user?.role?.name || "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
