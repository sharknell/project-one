import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  PaymentInputsWrapper,
  PaymentInputsContainer,
} from "react-payment-inputs";
import "../styles/PaymentForm.css"; // 스타일 파일 추가

const PaymentForm = ({ onSave, cards }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [cardInfo, setCardInfo] = useState({});
  const [newCard, setNewCard] = useState({});

  const onSubmitHandler = (data) => {
    onSave({ ...data, ...cardInfo });
    setNewCard({}); // 저장 후 폼 초기화
  };

  return (
    <div>
      <h2>결제 카드 등록</h2>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="payment-form">
        <div className="input-group">
          <label>카드 번호</label>
          <PaymentInputsWrapper>
            <PaymentInputsContainer
              onChange={(cardDetails) => setCardInfo(cardDetails)} // 카드 세부사항 저장
            />
          </PaymentInputsWrapper>
          {errors.cardNumber && <span>{errors.cardNumber.message}</span>}
        </div>

        <div className="input-group">
          <label>만료일</label>
          <input
            type="text"
            placeholder="MM/YY"
            {...register("expiryDate", { required: "만료일을 입력하세요." })}
          />
          {errors.expiryDate && <span>{errors.expiryDate.message}</span>}
        </div>

        <div className="input-group">
          <label>CVV</label>
          <input
            type="text"
            placeholder="CVV"
            {...register("cvv", { required: "CVV를 입력하세요." })}
          />
          {errors.cvv && <span>{errors.cvv.message}</span>}
        </div>

        <button type="submit">카드 등록</button>
      </form>

      <h3>등록된 카드</h3>
      <ul>
        {cards.map((card, index) => (
          <li key={index}>
            {card.cardNumber} - {card.expiryDate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentForm;
