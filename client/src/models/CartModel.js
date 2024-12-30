// src/models/cartModel.js
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
};

export const saveCartItems = (cartItems) => {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
};

export const removeCartItem = (cartItems, productId) => {
  return cartItems.filter((item) => item.id !== productId);
};

export const updateCartItemQuantity = (cartItems, productId, newQuantity) => {
  return cartItems.map((item) =>
    item.id === productId ? { ...item, quantity: newQuantity } : item
  );
};

export const calculateTotalPrice = (cartItems) => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
