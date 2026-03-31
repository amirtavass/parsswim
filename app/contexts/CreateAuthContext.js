"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/app/lib/api";

export function CreateAuthContext(endpointprefix, responeKey) {
  const GenericContext = createContext();

  function GenericProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      checkAuthStatus();
    }, []);
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/${endpointprefix}/me`);
        setCurrentUser(response.data[responeKey]);
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error(`Unexpected ${endpointprefix} check error:`, error);
        }
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const login = async (userData) => {
      setCurrentUser(userData);
      setIsAuthenticated(true);
    };

    const logout = async () => {
      try {
        await api.post(`/${endpointprefix}/logout`);
      } catch (error) {
        console.error(`Logout ${endpointprefix} error:`, error);
      } finally {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };
    return (
      <GenericContext.Provider
        value={{
          [responeKey]: currentUser,
          isAuthenticated,
          isLoading,
          login,
          logout,
          checkAuthStatus,
        }}
      >
        {children}
      </GenericContext.Provider>
    );
  }

  function useGenericAuth() {
    return useContext(GenericContext);
  }

  return {
    Provider: GenericProvider,
    useAuth: useGenericAuth,
  };
}
