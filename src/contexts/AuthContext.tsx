import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast'; 

// Ensure this matches your Flask backend root URL (no /api suffix for login/logout/verify_auth)
const API_BASE_URL = 'http://localhost:5000'; 

const AUTH_LOCAL_STORAGE_KEY = 'insightPulseUser';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  department: string;
  role: string; // 'admin', 'user', 'manager', 'rep', etc.
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Overall loading state for auth operations
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial loading state
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to attempt to verify and refresh authentication status with the backend
  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("AuthContext: Attempting to verify authentication status with backend...");
      const response = await fetch(`${API_BASE_URL}/verify_auth`, {
        method: 'GET',
        credentials: 'include', // IMPORTANT: Ensures HTTP-only cookies are sent
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(data.user));
          console.log("AuthContext: Auth verified by backend, user set:", data.user.username);
        } else {
          console.warn("AuthContext: Backend indicated not authenticated or missing user data. Clearing session.");
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
        }
      } else {
        // If response is not OK (e.g., 401 Unauthorized), session is not active
        console.error("AuthContext: Authentication refresh failed on server:", response.status, await response.text());
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      // Network error, backend down, CORS issue etc.
      console.error("AuthContext: Error during authentication refresh (network/fetch issue):", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]); 

  const login = async (username: string, password: string): Promise<User | null> => {
    setIsLoading(true); 
    try {
      console.log(`AuthContext: Attempting login for: ${username}`);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // CRITICAL: This sends cookies with the request and allows receiving HttpOnly cookies
      });

      if (response.ok) {
        const userData: User = await response.json(); 
        
        // Basic validation for the user data structure
        if (userData && typeof userData === 'object' && 
            'id' in userData && 'username' in userData && 
            'name' in userData && 'email' in userData && 
            'department' in userData && 'role' in userData) {

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(userData));

          toast({
            title: "Login successful",
            description: `Welcome back, ${userData.name}`,
          });

          return userData;
        } else {
          console.error("AuthContext: Login successful but invalid user data returned:", userData);
          toast({
            title: "Login Failed",
            description: "Invalid user data received from server. Please contact support.",
            variant: "destructive",
          });
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY); 
          return null;
        }
      } else {
        const errorData = await response.json();
        console.error("AuthContext: Login failed on server:", errorData);
        toast({
          title: "Login Failed",
          description: errorData.detail || "Invalid username or password",
          variant: "destructive",
        });
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
        return null;
      }
    } catch (error) {
      console.error('AuthContext: Login request failed (network error or unexpected exception):', error);
      toast({
        title: "Login Failed",
        description: "Unable to connect to the server. Please check your network and backend.",
        variant: "destructive",
      });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
      return null;
    } finally {
      setIsLoading(false); 
    }
  };

  const logout = async () => {
    setIsLoading(true); 
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include', 
        });
        if (!response.ok) {
            console.error("AuthContext: Logout failed on server:", await response.json());
            toast({ title: "Logout Failed", description: "Could not log out on the server.", variant: "destructive" });
        } else {
            console.log("AuthContext: Logout successful on server.");
        }
    } catch (error) {
        console.error("AuthContext: Error during logout request (network error):", error);
        toast({
            title: "Network Error",
            description: "An error occurred during logout. Please try again.",
            variant: "destructive",
        });
    } finally {
        setUser(null); 
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
            variant: "default", 
        });
        navigate('/'); 
        setIsLoading(false); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
