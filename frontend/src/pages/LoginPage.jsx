import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSeo } from '../hooks';
import { validators } from '../lib/validators';

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  useSeo({ title: 'Sign In' });

  if (user) { navigate('/account', { replace: true }); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (validators.email(email)) errs.email = validators.email(email);
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await signIn(email, password);
      toast('Welcome back!');
      navigate('/account');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>
        <p className="muted-text">Welcome back to Sherriez Scents</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />{errors.password && <span className="field-error">{errors.password}</span>}</label>
          <button type="submit" className="btn btn-primary btn-lg full" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Create one</Link></p>
        <p className="auth-demo muted-text small">Demo: admin@sherriezscents.com / SherriezAdmin#2026</p>
      </div>
    </div>
  );
}
