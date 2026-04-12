
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      return raw && token ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('auth_token') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('✅ Token guardado en localStorage:', token.substring(0, 20) + '...');
    } else {
      localStorage.removeItem('auth_token');
      console.log('🗑️ Token removido de localStorage');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { ok: false, message: error.error || 'Error en login' };
      }

      const data = await response.json();

      // El token viene en data.token
      const newToken = data.token;
      console.log('✅ Token recibido del servidor:', newToken ? 'Sí' : 'No');

      // Decodificar token para obtener datos del usuario
      try {
        const parts = newToken.split('.');
        const decodedPayload = JSON.parse(atob(parts[1]));
        console.log('✅ Token decodificado:', decodedPayload);

        const userData = {
          id: decodedPayload.id,
          email: decodedPayload.email,
          role: decodedPayload.rol || 'vendedor',
          nombre: decodedPayload.nombre || decodedPayload.email
        };

        console.log('📝 Guardando usuario:', userData);
        console.log('📝 Guardando token en localStorage y estado');
        
        // Guardar inmediatamente en localStorage para que esté disponible cuando el componente se actualice
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        console.log('✅ Usuario y token guardados en localStorage');
        
        // Actualizar el estado del componente
        setUser(userData);
        setToken(newToken);
        
        console.log('✅ Estado actualizado');

        return { ok: true };
      } catch (decodeError) {
        console.error('❌ Error decodificando token:', decodeError);
        return { ok: false, message: 'Error procesando datos de usuario' };
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { ok: false, message: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
