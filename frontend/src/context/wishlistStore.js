import { create } from 'zustand';

const storageKeyForUser = (userId) => `wishlist:${userId || 'guest'}`;

const readWishlist = (userId) => {
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWishlist = (userId, items) => {
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const pickStorableProduct = (product) => {
  if (!product) return null;

  const safe = {
    _id: product._id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    images: product.images,
    category: product.category,
    rating: product.rating,
    reviews: product.reviews,
    stock: product.stock,
    sizes: product.sizes,
  };

  return safe._id ? safe : null;
};

const useWishlistStore = create((set, get) => ({
  userId: null,
  items: [],

  ensureForUser: (user) => {
    const nextUserId = user?._id || null;
    if (get().userId === nextUserId && Array.isArray(get().items)) return;
    set({ userId: nextUserId, items: readWishlist(nextUserId) });
  },

  isInWishlist: (productId) => {
    if (!productId) return false;
    return get().items.some((p) => p?._id === productId);
  },

  toggle: (product) => {
    const storable = pickStorableProduct(product);
    if (!storable) return;

    const userId = get().userId;
    const exists = get().items.some((p) => p?._id === storable._id);
    const nextItems = exists
      ? get().items.filter((p) => p?._id !== storable._id)
      : [storable, ...get().items];

    set({ items: nextItems });
    writeWishlist(userId, nextItems);
  },

  remove: (productId) => {
    const userId = get().userId;
    const nextItems = get().items.filter((p) => p?._id !== productId);
    set({ items: nextItems });
    writeWishlist(userId, nextItems);
  },

  clear: () => {
    const userId = get().userId;
    set({ items: [] });
    writeWishlist(userId, []);
  },
}));

export default useWishlistStore;
