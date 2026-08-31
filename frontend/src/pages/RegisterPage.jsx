import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSeo } from '../hooks';
import { validators } from '../lib/validators';

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  useSeo({ title: 'Create Account' });

  if (user) { navigate('/account', { replace: true }); return null; }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (validators.minLen(form.name, 2, 'Name')) errs.name = validators.minLen(form.name, 2, 'Name');
    if (validators.email(form.email)) errs.email = validators.email(form.email);
    if (validators.password(form.password)) errs.password = validators.password(form.password);
    if (validators.match(form.password, form.confirmPassword)) errs.confirmPassword = validators.match(form.password, form.confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await signUp({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
      toast('Account created! Welcome to Sherriez Scents.');
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
        <h1>Create Account</h1>
        <p className="muted-text">Join the Sherriez Scents family</p>
        <form onSubmit={handleSubmit}>
          <label>Full Name<input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />{errors.name && <span className="field-error">{errors.name}</span>}</label>
          <label>Email<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          <label>Phone (optional)<input value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />{errors.password && <span className="field-error">{errors.password}</span>}</label>
          <label>Confirm Password<input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} autoComplete="new-password" />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}</label>
          <button type="submit" className="btn btn-primary btn-lg full" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
