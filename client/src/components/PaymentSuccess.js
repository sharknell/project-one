import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const paymentKey = params.get("paymentKey");
    const amount = params.get("amount");

    if (orderId && paymentKey && amount) {
      // 결제 성공 처리 로직
      console.log("결제 성공:", { orderId, paymentKey, amount });
      alert("결제가 성공적으로 완료되었습니다.");

      // 5초 뒤에 메인 페이지로 이동
      setTimeout(() => {
        navigate("/"); // 메인 페이지로 이동
      }, 1000);
    } else {
      alert("결제 정보가 부족합니다.");
    }
  }, [location, navigate]);

  return <div>결제 처리 중...</div>;
}

export default PaymentSuccess;
