import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import axios from "axios";

function PaymentSuccess() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    authToken,
    userId,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      alert("로그인 후 결제를 진행할 수 있습니다.");
      navigate("/login");
      return;
    }

    const token = authToken || localStorage.getItem("authToken");
    if (!token) {
      alert("로그인 상태를 확인해주세요.");
      navigate("/login");
      return;
    }

    // URLSearchParams로 쿼리 파라미터 받아오기
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const paymentKey = params.get("paymentKey");
    const amount = params.get("amount");

    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

    // 디버깅용 콘솔 출력
    console.log("orderId:", orderId);
    console.log("paymentKey:", paymentKey);
    console.log("amount:", amount);
    console.log("userId:", userId);
    console.log("cartItems:", cartItems);

    // 필수 값 체크
    if (
      !orderId ||
      !paymentKey ||
      !amount ||
      !userId ||
      cartItems.length === 0
    ) {
      setError("결제 정보가 부족합니다.");
      setLoading(false);
      return;
    }

    // 서버에 결제 성공 처리 요청
    axios
      .post("http://localhost:5001/api/payment/success", {
        orderId,
        paymentKey,
        amount,
        userId,
        cartItems,
      })
      .then((response) => {
        alert("결제가 성공적으로 완료되었습니다.");

        // 결제 완료 후 localStorage에서 cartItems 비워주기
        localStorage.removeItem("cartItems");

        // 5초 뒤 메인으로 이동
        setTimeout(() => {
          navigate("/");
        }, 5000);
      })
      .catch((err) => {
        console.error("결제 성공 처리 오류:", err);
        setError("서버에 결제 성공 처리 요청 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setLoading(false); // 로딩 종료
      });
  }, [authLoading, isAuthenticated, authToken, location, navigate, userId]);

  if (loading) {
    return <div>결제 처리 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return null;
}

export default PaymentSuccess;
