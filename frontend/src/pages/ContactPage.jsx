import { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { marketingService } from '../api/services';
import { useToast } from '../context/ToastContext';
import { validators } from '../lib/validators';
import { useSeo } from '../hooks';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  useSeo({ title: 'Contact Us' });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast('Please fill in all required fields.', 'error'); return; }
    if (validators.email(form.email)) { toast('Please enter a valid email.', 'error'); return; }
    setBusy(true);
    try {
      const res = await marketingService.contact(form);
      toast(res.message || 'Message sent!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container contact-page">
      <h1>Contact Us</h1>
      <div className="contact-layout">
        <form className="contact-form" onSubmit={submit}>
          <label>Name *<input value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Email *<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
          <label>Message *<textarea rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} /></label>
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send Message'}</button>
        </form>
        <div className="contact-info">
          <div className="contact-item"><Icon name="mail" size={20} /><div><h4>Email</h4><a href="mailto:hello@sherriezscents.com">hello@sherriezscents.com</a></div></div>
          <div className="contact-item"><Icon name="phone" size={20} /><div><h4>Phone</h4><a href="tel:+15550123456">+1 (555) 012-3456</a></div></div>
          <div className="contact-item"><Icon name="pin" size={20} /><div><h4>Address</h4><p>12 Amber Lane, Fragrance District, Metro City</p></div></div>
          <div className="contact-item"><Icon name="clock" size={20} /><div><h4>Hours</h4><p>Mon–Sat · 9am – 7pm</p></div></div>
        </div>
      </div>
    </div>
  );
}
