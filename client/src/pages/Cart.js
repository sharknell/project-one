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
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      console.log("로그인 상태가 아닙니다.");
      alert("로그인 후 장바구니를 확인할 수 있습니다.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const token = authToken || localStorage.getItem("authToken");
    if (!token) {
      console.log("토큰이 존재하지 않습니다.");
      alert("토큰이 존재하지 않습니다. 로그인 상태를 확인해주세요.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    let userId = null;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      console.log("Decoded User ID:", userId); // 디버깅을 위한 출력
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
        console.log("장바구니 아이템:", data); // 장바구니 아이템 출력

        if (data.message) {
          alert(data.message);
        } else {
          const items = data || [];
          setCartItems(items);
          setTotalAmount(calculateTotalAmount(items));
          console.log("장바구니 총 금액:", calculateTotalAmount(items)); // 총 금액 출력
        }
      } catch (error) {
        console.error("장바구니 데이터를 불러오는데 실패했습니다.", error);
        alert(`장바구니 데이터를 불러오는데 실패했습니다. ${error.message}`);
      }
    };

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
  }, [isAuthenticated, isLoading, authToken, navigate]);

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

      const token = authToken || localStorage.getItem("authToken");
      if (!token) {
        alert("로그인 상태를 확인해주세요.");
        return;
      }

      let userId;
      try {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.id;
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
        alert("토큰에서 userId를 추출하는데 실패했습니다.");
        setTimeout(() => navigate("/login"), 1000);
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
          user_id: userId,
          cartItems: cartItems.map((item) => ({
            productId: item.product_id,
            productName: item.product_name,
            productSize: item.product_size,
            quantity: item.quantity,
            thumbnail: item.thumbnail,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      tossPayments
        .requestPayment("카드", {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          successUrl: "http://localhost:5001/api/payment/success",
          failUrl: "http://localhost:5001/api/payment/failed",
          cancelUrl: "http://localhost:5001/api/payment/cancel",
        })
        .then(async () => {
          // 결제가 성공하면 장바구니 상태 초기화
          setCartItems([]);
          setTotalAmount(0);
          alert("결제가 완료되었습니다! 장바구니를 초기화합니다.");
          navigate("/payment-success");
        })
        .catch((error) => {
          console.error("결제 처리 중 오류가 발생했습니다.", error);
          alert("결제에 실패했습니다.");
          setLoading(false);
        });
    } catch (error) {
      console.error("결제 처리 중 오류 발생:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

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
              onClick={() => navigate("/add-address")}
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
              onClick={() => navigate("/profile")}
            >
              새로운 배송지 추가
            </button>
          </div>
        )}
      </div>

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
                        handleQuantityChangeHandler(
                          item.id,
                          Math.min(99, item.quantity + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="total-amount">
        <p>총 금액: ₩{totalAmount.toLocaleString()}</p>
        <button className="checkout-button" onClick={handleCheckoutHandler}>
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Cart;
