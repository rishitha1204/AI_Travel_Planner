import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { setAccessToken } from '../lib/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, the access token is gone (it's in-memory only) but the
  // HttpOnly refresh cookie may still be valid -- try to silently
  // re-establish a session before rendering protected routes.
  useEffect(() => {
    async function bootstrap() {
      try {
        const { user: refreshedUser, accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        setUser(refreshedUser);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, accessToken } = await authService.login(credentials);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, accessToken } = await authService.register(payload);
    setAccessToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {}); // logout is idempotent client-side regardless
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}