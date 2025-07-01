import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import Spinner from 'react-bootstrap/Spinner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    status: 'checking',
    operation: null
  });
  const [initialized, setInitialized] = useState(false);

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }, []);

  const redirectToLogin = useCallback((message = '') => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    setAuthState({ status: 'idle', operation: null });
    
    if (message) {
      sessionStorage.setItem('sessionMessage', message);
    }
    
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }, []);

  const redirectByRole = useCallback(() => {
    if (!user) return;
    
    const path = user.role === 'proveedor' 
      ? '/proveedor' 
      : user.role === 'cliente'
        ? '/cliente'
        : '/';
    
    if (!window.location.pathname.startsWith(path)) {
      window.location.href = path;
    }
  }, [user]);

  const getProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        redirectToLogin('Tu sesión ha expirado');
        return null;
      }
      
      const profile = await authAPI.getProfile();
      setUser(profile);
      setAuthState({ status: 'authenticated', operation: null });
      return profile;
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin('Tu sesión ha expirado');
      } else {
        console.error('Error cargando perfil', err);
      }
      return null;
    }
  }, [isTokenExpired, redirectToLogin]);

  const login = async (credentials) => {
    setAuthState({ status: 'loading', operation: 'login' });
    setError(null);
    
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      await getProfile();
      return true;
    } catch (err) {
      let errorMessage = 'Error en credenciales';
      let errorType = 'general';
      
      if (err.type === 'user_not_found') {
        errorMessage = 'Usuario no encontrado';
        errorType = 'user_not_found';
      } else if (err.type === 'invalid_credentials' || err.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas';
        errorType = 'invalid_credentials';
      }
      
      setError({ message: errorMessage, type: errorType });
      setAuthState({ status: 'error', operation: 'login' });
      localStorage.removeItem('token');
      return false;
    }
  };

  // Nueva función de registro
  const register = async (userData) => {
    setAuthState({ status: 'loading', operation: 'register' });
    setError(null);
    
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      await getProfile();
      return true;
    } catch (err) {
      setError({ 
        message: 'Error en registro: ' + (err.message || 'Revise los datos'), 
        type: 'register_error' 
      });
      setAuthState({ status: 'error', operation: 'register' });
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    setAuthState({ status: 'idle', operation: 'logout' });
    window.location.href = '/login';
  }, []);

  const updateProfile = async (updates) => {
    setAuthState({ status: 'loading', operation: 'update' });
    setError(null);
    
    try {
      const updatedProfile = await authAPI.updateProfile(updates);
      setUser(updatedProfile);
      setAuthState({ status: 'authenticated', operation: null });
      return true;
    } catch (err) {
      setError(err.message || 'Error actualizando perfil');
      setAuthState({ status: 'error', operation: 'update' });
      throw err;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !isTokenExpired(token)) {
        setAuthState({ status: 'loading', operation: 'profile' });
        await getProfile();
      } else {
        setAuthState({ status: 'idle', operation: null });
      }
      setInitialized(true);
    };

    verifyAuth();
  }, [getProfile, isTokenExpired]);

  // Redirigir según rol después de autenticación
  useEffect(() => {
    if (authState.status === 'authenticated') {
      redirectByRole();
    }
  }, [authState.status, redirectByRole]);

  if (!initialized) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: ['checking', 'loading'].includes(authState.status),
      authState,
      error,
      login, 
      logout, 
      register, // Nueva función
      updateProfile,
      getProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);