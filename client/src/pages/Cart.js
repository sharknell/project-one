// src/components/Cart.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  loadCartItems,
  handleRemoveItem,
  handleQuantityChange,
  handleCheckout,
  calculateTotalAmount,
} from "../controllers/CartController";
import "../styles/Cart.css";

function Cart() {
  const { isAuthenticated } = useAuth(); // 로그인 상태 확인
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // 장바구니 초기화 (localStorage에서 가져오기)
  useEffect(() => {
    if (!isAuthenticated) {
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      setTimeout(() => navigate("/login"), 1000); // alert 후 1초 뒤에 로그인 페이지로 리디렉션
      return;
    }
    const savedCart = loadCartItems();
    // 중복된 상품의 quantity 합산
    const updatedCart = savedCart.reduce((acc, item) => {
      const existingItem = acc.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity; // 같은 상품이면 수량 합산
      } else {
        acc.push(item); // 새로운 상품이면 추가
      }
      return acc;
    }, []);

    setCartItems(updatedCart);
  }, [isAuthenticated, navigate]);

  const handleRemove = (productId) => {
    const updatedCart = handleRemoveItem(cartItems, productId);
    setCartItems(updatedCart);
  };

  const handleQuantityChangeHandler = (productId, newQuantity) => {
    const updatedCart = handleQuantityChange(cartItems, productId, newQuantity);
    setCartItems(updatedCart);
  };

  const handleCheckoutHandler = () => {
    handleCheckout(isAuthenticated, navigate, setCartItems);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>장바구니가 비어 있습니다.</h1>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>장바구니</h1>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <p>{item.name}</p>
                <p>₩{item.price.toLocaleString()}</p>
                <p>용량: {item.size}</p> {/* 용량 표시 */}
                <div className="cart-item-quantity">
                  <button
                    onClick={() =>
                      handleQuantityChangeHandler(
                        item.id,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChangeHandler(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="remove-item-button"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>총 금액: ₩ {calculateTotalAmount(cartItems).toLocaleString()}</p>
        <button onClick={handleCheckoutHandler} className="checkout-button">
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Cart;
