import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function PaymentSuccess() {
  const { authToken } = useAuth(); // 인증 토큰 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const paymentKey = params.get("paymentKey");
    const amount = params.get("amount");

    if (!orderId || !paymentKey || !amount) {
      alert("결제 정보가 유효하지 않습니다.");
      navigate("/cart");
      return;
    }

    const fetchPaymentSuccess = async () => {
      try {
        // 인증 토큰을 헤더에 추가
        const { data } = await axios.get(
          `http://localhost:5001/api/payment/success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // 인증 토큰 추가
            },
          }
        );

        // 결제 성공 처리
        if (data.success) {
          alert("결제가 성공적으로 처리되었습니다.");
          navigate("/order-success"); // 주문 완료 페이지로 리디렉션
        } else {
          alert("결제에 실패했습니다.");
          navigate("/cart");
        }
      } catch (error) {
        console.error("결제 처리 오류:", error);
        alert("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/cart");
      }
    };

    fetchPaymentSuccess();
  }, [authToken, navigate]);

  return <div>결제 처리 중...</div>;
}

export default PaymentSuccess;
