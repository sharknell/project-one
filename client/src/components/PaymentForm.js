import React from "react";
import { useForm, Controller } from "react-hook-form";
import "../styles/PaymentForm.css"; // 스타일 파일 추가

const PaymentForm = ({ onSave, cards }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      cardNumber: ["", "", "", ""], // 카드 번호는 처음에 4개의 빈 배열로 설정
      expiryDate: "",
      cvv: "",
      cardHolder: "",
    },
  });

  // 폼 제출 시 카드 번호를 하나의 문자열로 결합
  const onSubmitHandler = (data) => {
    // 카드 번호를 하나로 합쳐서 저장
    const fullCardNumber = data.cardNumber.join("");

    // 카드 번호가 유효한지 체크
    if (!/^\d{16}$/.test(fullCardNumber)) {
      alert("유효한 카드 번호를 입력해주세요.");
      return;
    }

    // 콘솔에 전체 카드 정보 출력
    console.log("카드 정보:", { ...data, cardNumber: fullCardNumber });

    // 저장 함수 호출
    onSave({ ...data, cardNumber: fullCardNumber });

    // 폼 초기화
    reset({
      cardNumber: ["", "", "", ""],
      expiryDate: "",
      cvv: "",
      cardHolder: "",
    });
  };

  return (
    <div>
      <h2>결제 카드 등록</h2>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="payment-form">
        <div className="input-group">
          <label>카드 번호</label>
          <div className="card-number-group">
            {/* cardNumber 배열을 react-hook-form을 통해 관리 */}
            {Array.from({ length: 4 }).map((_, index) => (
              <Controller
                key={index}
                name={`cardNumber[${index}]`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="input-field"
                    placeholder="0000"
                    maxLength="4"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)} // 카드 번호 각 자리 수정
                  />
                )}
                rules={{
                  required: "카드 번호를 입력하세요.",
                  pattern: {
                    value: /^[0-9]{4}$/,
                    message: "각 그룹은 4자리 숫자여야 합니다.",
                  },
                }}
              />
            ))}
          </div>
          {errors.cardNumber && <span>{errors.cardNumber.message}</span>}
        </div>

        <div className="input-group">
          <label>만료일</label>
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="input-field"
                placeholder="MM/YY"
                maxLength="5"
              />
            )}
            rules={{
              required: "만료일을 입력하세요.",
            }}
          />
          {errors.expiryDate && <span>{errors.expiryDate.message}</span>}
        </div>

        <div className="input-group">
          <label>CVV</label>
          <Controller
            name="cvv"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="input-field"
                placeholder="CVV"
                maxLength="3"
              />
            )}
            rules={{
              required: "CVV를 입력하세요.",
            }}
          />
          {errors.cvv && <span>{errors.cvv.message}</span>}
        </div>

        <div className="input-group">
          <label>카드 소유자</label>
          <Controller
            name="cardHolder"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="input-field"
                placeholder="카드 소유자"
              />
            )}
            rules={{
              required: "카드 소유자를 입력하세요.",
            }}
          />
          {errors.cardHolder && <span>{errors.cardHolder.message}</span>}
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
