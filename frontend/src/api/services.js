import api from './axios.js';

// Auth APIs
export const authAPI = {
  // OTP-based registration
  requestRegistrationOTP: (data) => api.post('/auth/register/request-otp', data),
  verifyRegistrationOTP: (data) => api.post('/auth/register/verify-otp', data),
  resendRegistrationOTP: (data) => api.post('/auth/register/resend-otp', data),
  
  // OTP-based login
  requestLoginOTP: (data) => api.post('/auth/login/request-otp', data),
  verifyLoginOTP: (data) => api.post('/auth/login/verify-otp', data),
  
  // Other auth endpoints
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Export api for direct use in components
  post: (url, data) => api.post(url, data),
  get: (url, params) => api.get(url, { params }),
};

// Product APIs
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id) => api.delete(`/orders/${id}/cancel`),
};
