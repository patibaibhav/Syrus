import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Fetch fresh profile
        userAPI.getProfile().then((res) => {
          if (res.data.success) {
            setUser(res.data.data);
            setPersona(res.data.data.persona);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        }).catch(() => {
          // Token expired, clear
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token, user: userData, persona: personaData } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setPersona(personaData);
      return { success: true, user: userData };
    }
    return { success: false, error: res.data.error };
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data.success) {
      const { token, user: userData, persona: personaData } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setPersona(personaData);
      return { success: true, user: userData, persona: personaData };
    }
    return { success: false, error: res.data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPersona(null);
  };

  return (
    <AuthContext.Provider value={{ user, persona, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
