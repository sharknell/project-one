import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { calculateTotalAmount } from "../controllers/CartController";
import "../styles/Cart.css";
import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { jwtDecode } from "jwt-decode"; // JWT 디코딩을 위한 라이브러리 추가

function Cart() {
  const { isAuthenticated, isLoading, authToken } = useAuth();
  const [cartItems, setCartItems] = useState([]); // 기본값을 빈 배열로 설정
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const token = localStorage.getItem("authToken");
    console.log("JWT 토큰:", token);
    if (!token) {
      alert("토큰이 존재하지 않습니다. 로그인 상태를 확인해주세요.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    // JWT 토큰에서 userId 추출
    let userId = null;
    try {
      const decodedToken = jwtDecode(token); // 토큰 디코딩
      userId = decodedToken.id; // userId 추출
    } catch (error) {
      console.error("토큰 디코딩 실패:", error);
      alert("토큰에서 userId를 추출하는데 실패했습니다.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5001/cart?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response data:", data); // 전체 응답 데이터를 출력하여 구조를 확인하세요.

        if (data.message) {
          alert(data.message);
        } else {
          const items = data || []; // 예상되는 데이터 형식에 맞게 수정
          setCartItems(items);
          setTotalAmount(calculateTotalAmount(items)); // 총 금액 계산
        }
      } catch (error) {
        console.error("장바구니 데이터를 불러오는데 실패했습니다.", error);
        alert(`장바구니 데이터를 불러오는데 실패했습니다. ${error.message}`);
      }
    };

    fetchCartItems();
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    console.log("Cart Items:", cartItems); // 상태 업데이트 후 console.log로 확인
  }, [cartItems]);

  const handleQuantityChangeHandler = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // 수량이 1보다 적게 변경되지 않도록

    try {
      const { data } = await axios.put(
        `http://localhost:5001/cart/updateQuantity/${itemId}`,
        { quantity: newQuantity }
      );

      if (data.message === "장바구니 수량이 업데이트되었습니다.") {
        const updatedCartItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCartItems);
        setTotalAmount(calculateTotalAmount(updatedCartItems)); // 수량 변경 후 총 금액 업데이트
      }
    } catch (error) {
      console.error("장바구니 수량 변경 실패:", error);
      alert("장바구니 수량 변경에 실패했습니다.");
    }
  };

  // 장바구니에서 아이템 삭제
  const handleRemove = async (itemId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5001/cart/remove/${itemId}` // 수정된 URL
      );
      if (data.message === "장바구니에서 삭제되었습니다.") {
        const updatedCartItems = cartItems.filter((item) => item.id !== itemId);
        setCartItems(updatedCartItems);
        setTotalAmount(calculateTotalAmount(updatedCartItems));
      }
    } catch (error) {
      console.error("장바구니 삭제 실패:", error);
      alert("장바구니 아이템 삭제에 실패했습니다.");
    }
  };

  // 장바구니에 항목 추가
  const handleAddItem = async (item) => {
    try {
      const { data } = await axios.post("http://localhost:5001/api/cart", {
        itemId: item.id,
        quantity: 1, // 기본 수량 1
      });

      if (data.message === "장바구니에 아이템이 추가되었습니다.") {
        setCartItems((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
        setTotalAmount((prevAmount) => prevAmount + item.price); // 추가된 아이템의 가격만큼 총 금액 업데이트
      }
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert("장바구니에 아이템 추가에 실패했습니다.");
    }
  };

  // 결제 처리
  const handleCheckoutHandler = async () => {
    if (totalAmount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    if (!selectedAddress) {
      alert("배송지를 선택해주세요.");
      return;
    }

    try {
      setLoading(true);

      const tossPayments = await loadTossPayments(
        "test_ck_pP2YxJ4K87RqyvqEbgjLrRGZwXLO"
      );

      const { data } = await axios.post("http://localhost:5001/api/payment", {
        amount: totalAmount,
        orderName: "장바구니 상품",
        address: selectedAddress,
      });

      tossPayments
        .requestPayment("카드", {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          successUrl: "http://localhost:5001/api/payment/success",
          failUrl: "http://localhost:5001/api/payment/fail",
          cancelUrl: "http://localhost:5001/api/payment/cancel",
        })
        .then(() => {
          // 결제 성공 처리
        })
        .catch((error) => {
          console.error("결제 오류:", error);
          alert(
            `결제 취소되었습니다. ${
              error.message || "잠시 후 다시 시도해주세요."
            }`
          );
        });
    } catch (error) {
      console.error("결제 오류:", error);
      alert(
        `결제에 실패했습니다. ${error.message || "잠시 후 다시 시도해주세요."}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <div>로딩 중...</div>;
  }

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

      {/* 장바구니 아이템 표시 */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>장바구니에 아이템이 없습니다.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <img
                  src={item.image || "default_image_url"} // 이미지가 없으면 기본 이미지 사용
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <p>{item.name}</p>
                  <p>
                    ₩
                    {item.price
                      ? item.price.toLocaleString()
                      : "가격 정보 없음"}
                  </p>
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
          ))
        )}
      </div>

      <div className="cart-summary">
        <p>총 금액: ₩ {totalAmount ? totalAmount.toLocaleString() : "0"}</p>
        <button
          onClick={handleCheckoutHandler}
          className="checkout-button"
          disabled={loading}
        >
          {loading ? "결제 중..." : "결제하기"}
        </button>
      </div>
    </div>
  );
}

export default Cart;
