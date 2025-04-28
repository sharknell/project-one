import React, { useState, useEffect } from "react";
import "../../styles/AddressForm.css";

const AddressFormModal = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    recipient: "",
    phone: "",
    zipcode: "",
    roadAddress: "",
    detailAddress: "",
    isDefault: false,
  });
  const [isPostcodeVisible, setPostcodeVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.recipient) newErrors.recipient = "받는 사람을 입력해주세요.";
    if (!formData.phone) newErrors.phone = "전화번호를 입력해주세요.";
    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(formData.phone))
      newErrors.phone = "전화번호 형식이 올바르지 않습니다.";
    if (!formData.zipcode) newErrors.zipcode = "우편번호를 입력해주세요.";
    if (!formData.roadAddress)
      newErrors.roadAddress = "도로명 주소를 입력해주세요.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="toss-modal-backdrop">
      <div className="toss-form-modal">
        <form onSubmit={handleSubmit} className="toss-form">
          <h1 className="form-title">배송지 추가</h1>

          <div className="form-group">
            <label>받는 사람</label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              placeholder="예: 홍길동"
            />
            {errors.recipient && (
              <p className="error-text">{errors.recipient}</p>
            )}
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="예: 010-1234-5678"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label>우편번호</label>
            <div className="zipcode-group">
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="우편번호"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => setPostcodeVisible(true)}
              >
                검색
              </button>
            </div>
            {errors.zipcode && <p className="error-text">{errors.zipcode}</p>}
          </div>

          <div className="form-group">
            <label>도로명 주소</label>
            <input
              type="text"
              name="roadAddress"
              value={formData.roadAddress}
              onChange={handleChange}
              placeholder="예: 서울특별시 강남구 테헤란로 123"
            />
            {errors.roadAddress && (
              <p className="error-text">{errors.roadAddress}</p>
            )}
          </div>

          <div className="form-group">
            <label>상세 주소</label>
            <input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="예: 1동 101호"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              기본 배송지로 설정
            </label>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
