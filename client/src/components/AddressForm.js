import React, { useState, useEffect } from "react";
import DaumPostcode from "react-daum-postcode";
import "../styles/AddressForm.css";

const AddressForm = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    recipient: "",
    phone: "",
    zipcode: "",
    roadAddress: "",
    detailAddress: "",
    isDefault: false,
  });
  const [isPostcodeVisible, setPostcodeVisible] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePostcodeComplete = (data) => {
    setFormData((prev) => ({
      ...prev,
      zipcode: data.zonecode,
      roadAddress: data.roadAddress,
    }));
    setPostcodeVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="form-group">
        <label>받는 사람:</label>
        <input
          type="text"
          name="recipient"
          value={formData.recipient}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>전화번호:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>우편번호:</label>
        <input
          type="text"
          name="zipcode"
          value={formData.zipcode}
          onChange={handleChange}
          required
        />
        <button type="button" onClick={() => setPostcodeVisible(true)}>
          우편번호 찾기
        </button>
      </div>
      <div className="form-group">
        <label>도로명 주소:</label>
        <input
          type="text"
          name="roadAddress"
          value={formData.roadAddress}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>상세 주소:</label>
        <input
          type="text"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>
          기본 배송지로 설정
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="form-buttons">
        <button type="submit">저장</button>
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </div>

      {isPostcodeVisible && (
        <div className="postcode-modal">
          <DaumPostcode onComplete={handlePostcodeComplete} />
        </div>
      )}
    </form>
  );
};

export default AddressForm;
