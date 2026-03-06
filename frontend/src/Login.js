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

  const quick = async (e, correo, pass) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setEmail(correo);
    setPassword(pass);
    const res = await login(correo, pass);
    if (!res.ok) setError(res.message);
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Ingreso - Heladería</h1>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@heladeria.com"
            disabled={loading}
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <div className="quick-creds">
          <button onClick={(e) => quick(e, 'admin@heladeria.com', 'admin123')} disabled={loading}>
            Entrar como ADMIN
          </button>
          <button onClick={(e) => quick(e, 'vendedor@heladeria.com', 'vend123')} disabled={loading}>
            Entrar como VENDEDOR
          </button>
        </div>

        <p className="nota">
          🔐 Credenciales de prueba:<br/>
          Admin: admin@heladeria.com / admin123<br/>
          Vendedor: vendedor@heladeria.com / vend123
        </p>
      </div>
    </div>
  );
}