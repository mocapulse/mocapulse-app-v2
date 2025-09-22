"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAirService, resetAirService } from '@/lib/airkit';
import { AirService } from '@mocanetwork/airkit';

interface AirKitUser {
  id: string;
  uuid: string;
  [key: string]: any;
}

interface AirKitContextType {
  user: AirKitUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  airService: AirService | null;
}

const AirKitContext = createContext<AirKitContextType | undefined>(undefined);

export const useAirKit = () => {
  const context = useContext(AirKitContext);
  if (!context) {
    throw new Error('useAirKit must be used within an AirKitProvider');
  }
  return context;
};

interface AirKitProviderProps {
  children: ReactNode;
}

export const AirKitProvider: React.FC<AirKitProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AirKitUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [airService, setAirService] = useState<AirService | null>(null);

  useEffect(() => {
    const initializeAirKit = async () => {
      try {
        const service = await getAirService();
        setAirService(service);

        // Check if user is already logged in
        // This would depend on AIR Kit's session management
        // For now, we'll set loading to false
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize AIR Kit:', error);
        setIsLoading(false);
      }
    };

    initializeAirKit();
  }, []);

  const login = useCallback(async () => {
    if (!airService) {
      throw new Error('AIR Kit service not initialized');
    }

    try {
      setIsLoading(true);
      const loginResult = await airService.login();

      if (loginResult) {
        // Extract user information from login result
        const userData: AirKitUser = {
          id: loginResult.uuid || loginResult.id,
          uuid: loginResult.uuid || loginResult.id,
          ...loginResult
        };

        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [airService]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // If AIR Kit has a logout method, use it
      if (airService && typeof (airService as any).logout === 'function') {
        await (airService as any).logout();
      }

      setUser(null);
      setIsAuthenticated(false);

      // Reset the service
      resetAirService();
      setAirService(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [airService]);

  const value: AirKitContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    airService,
  };

  return (
    <AirKitContext.Provider value={value}>
      {children}
    </AirKitContext.Provider>
  );
};