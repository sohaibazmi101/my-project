export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existing = cart.find((item) => item.product._id === product._id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  saveCart(cart);
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.product._id !== productId);
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};
