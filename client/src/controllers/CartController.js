// src/controllers/cartController.js
import {
  getCartItems,
  saveCartItems,
  removeCartItem,
  updateCartItemQuantity,
  calculateTotalPrice,
} from "../models/CartModel";

export const loadCartItems = () => {
  return getCartItems();
};

export const handleRemoveItem = (cartItems, productId) => {
  const updatedCart = removeCartItem(cartItems, productId);
  saveCartItems(updatedCart);
  return updatedCart;
};

export const handleQuantityChange = (cartItems, productId, newQuantity) => {
  const updatedCart = updateCartItemQuantity(cartItems, productId, newQuantity);
  saveCartItems(updatedCart);
  return updatedCart;
};

export const handleCheckout = (isAuthenticated, navigate, setCartItems) => {
  if (!isAuthenticated) {
    alert("로그인 후 결제 가능합니다.");
    setTimeout(() => navigate("/login"), 1000); // alert 후 1초 뒤에 로그인 페이지로 리디렉션
    return;
  }

  alert("결제가 완료되었습니다.");
  setCartItems([]); // 장바구니 비우기
  localStorage.removeItem("cartItems"); // 로컬 스토리지에서 장바구니 데이터 삭제
  navigate("/"); // 홈 페이지로 리디렉션
};

export const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
