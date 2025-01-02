import React, { useState, useEffect } from "react";

const AddressForm = ({ addressToEdit, onSave, onCancel }) => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    if (addressToEdit) {
      setAddress(addressToEdit); // 기존 배송지 데이터가 있으면 폼에 초기값 설정
    }
  }, [addressToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(address); // 저장 처리
  };

  return (
    <div className="address-form">
      <h2>{addressToEdit ? "배송지 편집" : "새 배송지 추가"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>주소:</label>
          <input
            type="text"
            name="street"
            value={address.street}
            onChange={handleInputChange}
            className="input"
            placeholder="예: 1234 Main St"
            required
          />
        </div>
        <div className="form-group">
          <label>도시:</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
        <div className="form-group">
          <label>주(State):</label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
        <div className="form-group">
          <label>우편번호:</label>
          <input
            type="text"
            name="zip"
            value={address.zip}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="save-btn">
            저장
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
