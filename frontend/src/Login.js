import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email.trim(), password);
    if (!res.ok) setError(res.message || 'Error de login');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>🍦 Grido Laspiur</h1>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <label>Usuario</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu nombre de usuario"
            autoComplete="username"
            disabled={loading}
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}