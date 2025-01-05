import React, { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import "../styles/PaymentForm.css";
import tossLogo from "../asset/toss.png";

// 카드사 목록
const cardBrands = [
  { value: "toss", name: "토스뱅크", logo: tossLogo },
  // { value: "shinhan", name: "신한카드", logo: shinhanLogo },
  // { value: "kb", name: "국민카드", logo: kbLogo },
  // { value: "hana", name: "하나카드", logo: hanaLogo },
  // { value: "lotte", name: "롯데카드", logo: lotteLogo },
  // { value: "nh", name: "농협카드", logo: nhLogo },
  // { value: "samsung", name: "삼성카드", logo: samsungLogo },
  // { value: "hyundai", name: "현대카드", logo: hyundaiLogo },
  // { value: "bc", name: "BC카드", logo: bcLogo },
  // { value: "woori", name: "우리카드", logo: wooriLogo },
];

const PaymentForm = ({ onSave }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      cardBrand: "",
      cardNumber: ["", "", "", ""],
      expiryDate: ["", ""],
      cvv: "",
      cardHolder: "",
    },
  });

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const onSubmitHandler = (data) => {
    const fullCardNumber = data.cardNumber.join(""); // 배열을 문자열로 변환
    if (!/^\d{16}$/.test(fullCardNumber)) {
      alert("유효한 카드 번호를 입력해주세요.");
      return;
    }

    const requestData = {
      cardBrand: data.cardBrand,
      cardNumber: fullCardNumber, // 카드 번호는 배열이 아닌 문자열로 전송
      expiryMonth: data.expiryDate[0],
      expiryYear: data.expiryDate[1],
      cvv: data.cvv,
      cardHolder: data.cardHolder,
    };

    fetch("http://localhost:5001/profile/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // 인증 토큰 필요
      },
      body: JSON.stringify(requestData), // 데이터는 JSON 형식으로 전송
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "카드가 등록되었습니다.") {
          alert("카드 등록이 완료되었습니다.");
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleCardNumberChange = (value, index) => {
    const cardNumber = [...inputRefs.map((ref) => ref.current.value)];
    cardNumber[index] = value;

    if (value.length === 4 && index < 3) {
      inputRefs[index + 1].current.focus();
    }

    return cardNumber;
  };

  const handleExpiryChange = (value, index) => {
    const expiryDate = [...inputRefs.map((ref) => ref.current.value)];
    expiryDate[index] = value;

    if (index === 0 && value.length === 2) {
      // 월을 입력하면 연도 필드로 포커스를 이동
      inputRefs[5].current.focus();
    }

    return expiryDate;
  };

  return (
    <div className="payment-form-container">
      <h2 className="form-title">💳 카드 등록</h2>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="payment-form">
        {/* 카드사 선택 */}
        <div className="input-group">
          <label>카드사 선택</label>
          <Controller
            name="cardBrand"
            control={control}
            render={({ field }) => (
              <div className="custom-select">
                <select {...field} className="input-field">
                  <option value="" disabled>
                    카드사를 선택하세요
                  </option>
                  {cardBrands.map((brand) => (
                    <option key={brand.value} value={brand.value}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <div className="logo-container">
                  {cardBrands.map((brand) => (
                    <div
                      key={brand.value}
                      className={`logo ${
                        field.value === brand.value ? "selected" : ""
                      }`}
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        width={30}
                        height={30}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            rules={{ required: "카드사를 선택하세요." }}
          />
          {errors.cardBrand && (
            <span className="error-text">{errors.cardBrand.message}</span>
          )}
        </div>

        {/* 카드 번호 입력 */}
        <div className="input-group">
          <label>카드 번호</label>
          <div className="card-number-group">
            {Array.from({ length: 4 }).map((_, index) => (
              <Controller
                key={index}
                name={`cardNumber[${index}]`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    ref={inputRefs[index]}
                    type="text"
                    className="input-field"
                    placeholder="0000"
                    maxLength="4"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      handleCardNumberChange(e.target.value, index);
                    }}
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
          {errors.cardNumber && (
            <span className="error-text">{errors.cardNumber.message}</span>
          )}
        </div>

        {/* 만료일 입력 */}
        <div className="input-group">
          <label>만료일</label>
          <div className="expiry-date-group">
            <Controller
              name="expiryDate[0]"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  ref={inputRefs[4]}
                  type="text"
                  className="input-field"
                  placeholder="MM"
                  maxLength="2"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    handleExpiryChange(e.target.value, 0);
                  }}
                />
              )}
              rules={{
                required: "만료일을 입력하세요.",
                pattern: {
                  value: /^(0[1-9]|1[0-2])$/,
                  message: "MM 형식으로 입력하세요.",
                },
              }}
            />
            /
            <Controller
              name="expiryDate[1]"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  ref={inputRefs[5]}
                  type="text"
                  className="input-field"
                  placeholder="YY"
                  maxLength="2"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    handleExpiryChange(e.target.value, 1);
                  }}
                />
              )}
              rules={{
                required: "만료일을 입력하세요.",
                pattern: {
                  value: /^\d{2}$/,
                  message: "YY 형식으로 입력하세요.",
                },
              }}
            />
          </div>
          {errors.expiryDate && (
            <span className="error-text">{errors.expiryDate.message}</span>
          )}
        </div>

        {/* CVV 입력 */}
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
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: "CVV는 3자리 또는 4자리 숫자여야 합니다.",
              },
            }}
          />
          {errors.cvv && (
            <span className="error-text">{errors.cvv.message}</span>
          )}
        </div>

        {/* 카드 소유자 입력 */}
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
          {errors.cardHolder && (
            <span className="error-text">{errors.cardHolder.message}</span>
          )}
        </div>

        <button type="submit" className="submit-button">
          카드 등록
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
