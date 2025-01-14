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
  const [selectedAddress, setSelectedAddress] = useState(null); // 선택된 배송지
  const [addresses, setAddresses] = useState([]); // 사용자 배송지 목록
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const token = localStorage.getItem("authToken"); // authToken을 직접 가져옴
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

        if (data.message) {
          alert(data.message);
        } else {
          const items = data || [];
          setCartItems(items);
          setTotalAmount(calculateTotalAmount(items)); // 총 금액 계산
        }
      } catch (error) {
        console.error("장바구니 데이터를 불러오는데 실패했습니다.", error);
        alert(`장바구니 데이터를 불러오는데 실패했습니다. ${error.message}`);
      }
    };

    // 배송지 목록 불러오기
    const fetchAddresses = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5001/cart/addresses?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("배송지 데이터:", data);
        setAddresses(data);
      } catch (error) {
        console.error("배송지 데이터를 불러오는데 실패했습니다.", error);
        alert("배송지 데이터를 불러오는데 실패했습니다.");
      }
    };

    fetchCartItems();
    fetchAddresses();
  }, [isAuthenticated, isLoading, navigate]);

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
        `http://localhost:5001/cart/remove/${itemId}`
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

      const token = localStorage.getItem("authToken"); // 로컬 스토리지에서 토큰 가져오기
      if (!token) {
        alert("로그인 상태를 확인해주세요.");
        return;
      }

      const tossPayments = await loadTossPayments(
        "test_ck_pP2YxJ4K87RqyvqEbgjLrRGZwXLO"
      );

      const { data } = await axios.post(
        "http://localhost:5001/api/payment",
        {
          amount: totalAmount,
          orderName: "장바구니 상품",
          address: selectedAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 토큰 포함
          },
        }
      );

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
          alert("결제가 완료되었습니다.");
          navigate("/order-success"); // 결제 성공 후 주문 완료 페이지로 이동
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

      <div className="address-selection">
        <h2>배송지 선택</h2>
        {addresses.length === 0 ? (
          <div>
            <p>배송지가 없습니다. 배송지를 추가해주세요.</p>
            <button
              className="add-address-button"
              onClick={() => navigate("/add-address")} // 배송지 추가 페이지로 이동
            >
              배송지 추가하기
            </button>
          </div>
        ) : (
          <div>
            <select
              onChange={(e) => setSelectedAddress(e.target.value)}
              value={selectedAddress || ""}
            >
              <option value="" disabled>
                배송지를 선택하세요
              </option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.nickname} - {address.roadAddress},{" "}
                  {address.detailAddress}
                </option>
              ))}
            </select>
            <button
              className="add-address-button"
              onClick={() => navigate("/profile")} // 배송지 추가 페이지로 이동
            >
              새로운 배송지 추가
            </button>
          </div>
        )}
      </div>

      {/* 장바구니 아이템 표시 */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>장바구니에 아이템이 없습니다.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <img
                  src={item.thumbnail || "default_image_url"}
                  alt={item.product_name || "상품 이미지"}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <p>{item.product_name || "상품명 없음"}</p>
                  <p>
                    ₩
                    {item.price
                      ? item.price.toLocaleString()
                      : "가격 정보 없음"}
                  </p>
                  <p>용량: {item.product_size || "사이즈 정보 없음"}</p>
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
          disabled={loading || !selectedAddress}
        >
          {loading ? "결제 중..." : "결제하기"}
        </button>
      </div>
    </div>
  );
}

export default Cart;
