import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { calculateTotalAmount } from "../controllers/CartController";
import "../styles/Cart.css";
import axios from "axios";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { jwtDecode } from "jwt-decode";

function Cart() {
  const { isAuthenticated, isLoading: authLoading, authToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      navigateWithDelay("/login");
      return;
    }

    const token = authToken || localStorage.getItem("authToken");
    if (!token) {
      alert("로그인 상태를 확인해주세요.");
      navigateWithDelay("/login");
      return;
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      navigateWithDelay("/login");
      return;
    }

    fetchData(userId, token);
  }, [isAuthenticated, authLoading, authToken]);

  const navigateWithDelay = (path) => {
    setTimeout(() => navigate(path), 1000);
  };

  const extractUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("토큰 디코딩 실패:", error);
      return null;
    }
  };

  const fetchData = async (userId, token) => {
    try {
      // 먼저 카트 데이터만 가져오기
      const cartRes = await axios.get(
        `http://localhost:5001/cart?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("카트 데이터:", cartRes.data); // 카트 데이터 확인

      // 배송지 정보를 가져오는 API 요청을 시도
      let addressRes = { data: [] }; // 기본값을 빈 배열로 설정

      try {
        addressRes = await axios.get(
          `http://localhost:5001/cart/addresses?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("배송지 데이터:", addressRes.data); // 배송지 데이터 확인
      } catch (addressError) {
        console.error("배송지 정보 불러오기 실패:", addressError);
        // 배송지 API 실패 시 빈 배열로 처리
      }

      setCartItems(cartRes.data || []);
      setTotalAmount(calculateTotalAmount(cartRes.data || []));

      // 배송지 데이터가 있을 경우만 설정
      if (addressRes.data && addressRes.data.length > 0) {
        setAddresses(addressRes.data);
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
      setCartItems([]);
      setTotalAmount(0);
      setAddresses([]);
    } finally {
      setPageLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    console.log("수량 변경 요청:", itemId, newQuantity);

    try {
      const { data } = await axios.put(
        `http://localhost:5001/cart/updateQuantity/${itemId}`,
        { quantity: newQuantity }
      );

      console.log("수량 변경 결과:", data);

      if (
        data.success ||
        data.message === "장바구니 수량이 업데이트되었습니다."
      ) {
        const updatedItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        setTotalAmount(calculateTotalAmount(updatedItems));
      }
    } catch (error) {
      console.error("수량 변경 실패:", error);
      alert("장바구니 수량 변경에 실패했습니다.");
    }
  };
  const handleRemove = async (itemId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5001/cart/remove/${itemId}`
      );
      if (data.success) {
        // 카트 아이템에서 삭제한 아이템 제외하고 업데이트
        const updatedCartItems = cartItems.filter((item) => item.id !== itemId);
        setCartItems(updatedCartItems); // 카트 아이템 갱신
      }
    } catch (error) {
      alert("장바구니 아이템 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    // cartItems 상태가 변경될 때마다 총 금액을 갱신
    setTotalAmount(calculateTotalAmount(cartItems));
  }, [cartItems]); // cartItems 상태가 변경될 때마다 실행

  const handleCheckout = async () => {
    if (totalAmount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    if (!selectedAddress && addresses.length > 0) {
      alert("배송지를 선택해주세요.");
      return;
    }

    try {
      setLoading(true);

      const token = authToken || localStorage.getItem("authToken");
      const userId = extractUserIdFromToken(token);
      if (!userId) return;

      const tossPayments = await loadTossPayments(
        "test_ck_pP2YxJ4K87RqyvqEbgjLrRGZwXLO"
      );

      const { data } = await axios.post(
        "http://localhost:5001/api/payment",
        {
          amount: totalAmount,
          orderName: "장바구니 상품",
          address: selectedAddress,
          user_id: userId,
          cartItems: cartItems.map(
            ({
              product_id,
              product_name,
              product_size,
              quantity,
              thumbnail,
            }) => ({
              productId: product_id,
              productName: product_name,
              productSize: product_size,
              quantity,
              thumbnail,
            })
          ),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 결제 전에 cartItems를 localStorage에 저장
      localStorage.setItem("cartItems", JSON.stringify(cartItems));

      await tossPayments.requestPayment("카드", {
        amount: data.amount,
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: "http://localhost:3000/payment-success",
        failUrl: "http://localhost:3000/payment-failed",
        cancelUrl: "http://localhost:3000/payment-cancel",
      });

      clearCartAfterPayment();
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const clearCartAfterPayment = () => {
    setCartItems([]);
    setTotalAmount(0);
    alert("결제가 완료되었습니다!");
    navigate("/payment-success");
  };

  const IMAGE_BASE_URL = "http://localhost:5001/uploads/productImages/";

  if (pageLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="cart-container">
      <h1>장바구니</h1>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>장바구니에 아이템이 없습니다.</p>
        ) : (
          cartItems.map(
            ({
              id,
              thumbnail,
              product_name,
              price,
              product_size,
              quantity,
            }) => (
              <div key={id} className="cart-item">
                <div className="cart-item-details">
                  <img
                    src={
                      thumbnail
                        ? `${IMAGE_BASE_URL}${thumbnail}`
                        : "https://via.placeholder.com/150"
                    }
                    alt={product_name || "상품 이미지"}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <p>{product_name}</p>
                    <p>₩{Number(price || 0).toLocaleString("ko-KR")}</p>
                    <p>
                      용량: {Number(product_size || 0).toLocaleString("ko-KR")}{" "}
                      ml
                    </p>

                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(id, quantity - 1)}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(id)}
                  className="remove-item-button"
                >
                  삭제
                </button>
              </div>
            )
          )
        )}
      </div>

      <div className="address-selection">
        <h2>배송지 선택</h2>
        {addresses.length === 0 ? (
          <div>
            <p>배송지가 없습니다. 배송지를 추가해주세요.</p>
            <button onClick={() => navigate("/profile")}>
              배송지 추가하기
            </button>
          </div>
        ) : (
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          >
            <option value="">배송지를 선택하세요</option>
            {addresses.map(({ id, nickname, roadAddress, detailAddress }) => (
              <option key={id} value={id}>
                {nickname} - {roadAddress}, {detailAddress}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="cart-summary">
        <p>총 금액: ₩{totalAmount.toLocaleString()}</p>
        <button onClick={handleCheckout} disabled={loading || !selectedAddress}>
          {loading ? "결제 중..." : "결제하기"}
        </button>
      </div>
    </div>
  );
}

export default Cart;
