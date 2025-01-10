import React, { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const paymentKey = urlParams.get("paymentKey");
    const amount = urlParams.get("amount");

    if (!orderId || !paymentKey || !amount) {
      setError("결제 정보가 부족합니다.");
      return;
    }

    const postPaymentSuccess = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/payment/success",
          {
            method: "POST", // POST 요청으로 변경
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              amount,
              orderName: "Sample Product",
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          setPaymentStatus(result.message);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("결제 상태 처리 중 오류가 발생했습니다.");
      }
    };

    postPaymentSuccess();
  }, []);

  if (error) {
    return <div>오류: {error}</div>;
  }

  if (paymentStatus) {
    return <div>결제 성공: {paymentStatus}</div>;
  }

  return <div>결제 성공을 확인하는 중...</div>;
};

export default PaymentSuccess;
