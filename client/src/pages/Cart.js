import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  loadCartItems,
  calculateTotalAmount,
} from "../controllers/CartController";
import "../styles/Cart.css";
import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";

function Cart() {
  const { isAuthenticated, isLoading } = useAuth(); // 인증 상태와 로딩 상태 받아오기
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 인증 상태와 장바구니 아이템 로딩 처리
  useEffect(() => {
    if (isLoading) {
      return; // 인증 상태가 아직 로딩 중이면 아무것도 하지 않음
    }

    console.log("isAuthenticated: ", isAuthenticated); // 인증 상태 확인

    if (!isAuthenticated) {
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      setTimeout(() => navigate("/login"), 1000); // 로그인 페이지로 이동
      return;
    }

    if (cartItems.length === 0) {
      const savedCart = loadCartItems(); // 장바구니 아이템 로딩
      console.log("savedCart: ", savedCart); // 로컬스토리지에서 장바구니 아이템 확인

      if (savedCart && savedCart.length > 0) {
        const updatedCart = savedCart.reduce((acc, item) => {
          const existingItem = acc.find((cartItem) => cartItem.id === item.id);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            acc.push(item);
          }
          return acc;
        }, []);
        console.log("updatedCart: ", updatedCart); // 업데이트된 카트 내용 확인

        setCartItems(updatedCart);
        setTotalAmount(calculateTotalAmount(updatedCart)); // 총 금액 계산
      } else {
        console.log("장바구니가 비어 있습니다.");
      }
    }
  }, [isAuthenticated, isLoading, navigate, cartItems.length]); // cartItems.length 의존성 추가

  // 로컬스토리지에 장바구니 아이템 저장
  const saveCartItems = (updatedCart) => {
    console.log("saveCartItems called with: ", updatedCart); // saveCartItems 호출 시 확인
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  // 수량 변경 핸들러
  const handleQuantityChangeHandler = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // 수량이 1보다 작으면 변경 안 함
    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    setTotalAmount(calculateTotalAmount(updatedCart));
    saveCartItems(updatedCart); // 로컬 스토리지에 저장
  };

  // 아이템 삭제 핸들러
  const handleRemove = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    setTotalAmount(calculateTotalAmount(updatedCart));
    saveCartItems(updatedCart); // 로컬 스토리지에 저장
  };

  // 결제 처리 핸들러
  const handleCheckoutHandler = async () => {
    if (totalAmount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    try {
      setLoading(true); // 로딩 시작

      const tossPayments = await loadTossPayments(
        "test_ck_pP2YxJ4K87RqyvqEbgjLrRGZwXLO"
      );

      const { data } = await axios.post("http://localhost:5001/api/payment", {
        amount: totalAmount,
        orderName: "장바구니 상품",
      });

      tossPayments.requestPayment("카드", {
        amount: data.amount,
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: "http://localhost:5001/api/payment/success", // 결제 성공 시 URL
        failUrl: "http://localhost:5001/api/payment/fail", // 결제 실패 시 URL
        cancelUrl: "http://localhost:5001/api/payment/cancel", // 결제 취소 시 URL
      });
    } catch (error) {
      console.error("결제 오류:", error);
      alert(
        `결제에 실패했습니다. ${error.message || "잠시 후 다시 시도해주세요."}`
      );
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 결제 성공 시 처리
  useEffect(() => {
    if (window.location.pathname.includes("success")) {
      setCartItems([]);
      setTotalAmount(0);
      alert("결제가 완료되었습니다. 카트가 비워졌습니다.");
      localStorage.removeItem("cartItems"); // 로컬 스토리지에서 카트 삭제
      navigate("/"); // 홈 페이지로 리디렉션
    }
  }, [navigate]);

  // 로딩 중 처리
  if (isLoading || loading) {
    return <div>로딩 중...</div>;
  }

  // 장바구니가 비어있는 경우
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>장바구니가 비어 있습니다.</h1>
      </div>
    );
  }

  // 장바구니 내용 표시
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
                <p>용량: {item.size}</p>
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
        <p>총 금액: ₩ {totalAmount.toLocaleString()}</p>
        <button
          onClick={handleCheckoutHandler}
          className="checkout-button"
          disabled={loading}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Cart;
