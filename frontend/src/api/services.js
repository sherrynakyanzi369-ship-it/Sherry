import { api } from './client';

export const productService = {
  all: () => api.get('/products'),
  meta: () => api.get('/products/meta'),
  bySlug: (slug) => api.get(`/products/${slug}`),
  related: (slug) => api.get(`/products/${slug}/related`),
  reviews: (slug) => api.get(`/products/${slug}/reviews`),
  addReview: (slug, review) => api.post(`/products/${slug}/reviews`, review),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.put('/auth/password', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  addresses: () => api.get('/auth/account/addresses'),
  addAddress: (a) => api.post('/auth/account/addresses', a),
  removeAddress: (id) => api.delete(`/auth/account/addresses/${id}`),
};

export const orderService = {
  place: (payload) => api.post('/orders', payload),
  mine: () => api.get('/orders/mine'),
  detail: (number, contact) => api.get(`/orders/${number}${contact ? `?contact=${encodeURIComponent(contact)}` : ''}`),
  track: (number, contact) => api.get(`/orders/track?number=${encodeURIComponent(number)}&contact=${encodeURIComponent(contact)}`),
  cancel: (number, contact) =>
    api.patch(`/orders/${number}/cancel${contact ? `?contact=${encodeURIComponent(contact)}` : ''}`),
};

export const couponService = {
  validate: (code, subtotal) => api.get(`/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),
};

export const marketingService = {
  banners: () => api.get('/banners/active'),
  stats: () => api.get('/stats/public'),
  newsletter: (email) => api.post('/newsletter', { email }),
  contact: (payload) => api.post('/contact', payload),
};

export const adminService = {
  overview: () => api.get('/admin/overview'),
  products: () => api.get('/admin/products'),
  updateProduct: (id, patch) => api.patch(`/admin/products/${id}`, patch),
  orders: (status) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  customers: () => api.get('/admin/customers'),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (c) => api.post('/admin/coupons', c),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  banners: () => api.get('/admin/banners'),
  updateBanner: (id, patch) => api.patch(`/admin/banners/${id}`, patch),
};
