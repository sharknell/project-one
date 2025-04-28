import React, { useEffect, useState } from "react";

const PaymentFail = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 쿼리 파라미터에서 데이터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const paymentKey = urlParams.get("paymentKey");
    const amount = urlParams.get("amount");

    if (!orderId || !paymentKey || !amount) {
      setError("결제 정보가 부족합니다.");
      return;
    }

    // 결제 실패 처리 요청
    const postPaymentFail = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/payment/fail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            amount,
            orderName: "Sample Product",
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setPaymentStatus(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("결제 상태 처리 중 오류가 발생했습니다.");
      }
    };

    postPaymentFail();
  }, []);

  if (error) {
    return <div>오류: {error}</div>;
  }

  if (paymentStatus) {
    return <div>결제 실패: {paymentStatus}</div>;
  }

  return <div>결제 실패를 확인하는 중...</div>;
};

export default PaymentFail;
