import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

function readToken() {
  try {
    return localStorage.getItem('sherriez.token');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(readToken());

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setReady(true);
      return () => {};
    }
    authService
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        localStorage.removeItem('sherriez.token');
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const signIn = useCallback((email, password) =>
    authService.login(email, password).then(({ token: t, user: u }) => {
      localStorage.setItem('sherriez.token', t);
      setToken(t);
      setUser(u);
      return u;
    }), []);

  const signUp = useCallback((payload) =>
    authService.register(payload).then(({ token: t, user: u }) => {
      localStorage.setItem('sherriez.token', t);
      setToken(t);
      setUser(u);
      return u;
    }), []);

  const signOut = useCallback(() => {
    localStorage.removeItem('sherriez.token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, token, signIn, signUp, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
