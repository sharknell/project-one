import React, { useState, useEffect } from "react";
import DaumPostcode from "react-daum-postcode"; // react-daum-postcode import
import "../styles/AddressForm.css"; // CSS 파일 import

const AddressForm = ({ address, onSave, onCancel }) => {
  const [recipient, setRecipient] = useState(address ? address.recipient : "");
  const [phone, setPhone] = useState(address ? address.phone : "");
  const [zipcode, setZipcode] = useState(address ? address.zipcode : "");
  const [roadAddress, setRoadAddress] = useState(
    address ? address.roadAddress : ""
  );
  const [detailAddress, setDetailAddress] = useState(
    address ? address.detailAddress : ""
  );
  const [isDefault, setIsDefault] = useState(
    address ? address.isDefault : false
  );
  const [isPostcodeVisible, setPostcodeVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      recipient,
      phone,
      zipcode,
      roadAddress,
      detailAddress,
      isDefault,
    });
  };

  const openAddressSearch = () => {
    setPostcodeVisible(true); // 주소 검색 창 열기
  };

  const handlePostcodeComplete = (data) => {
    setZipcode(data.zonecode); // 우편번호
    setRoadAddress(data.roadAddress); // 도로명 주소
    setPostcodeVisible(false); // 주소 검색 창 닫기
  };

  useEffect(() => {
    if (address) {
      setRecipient(address.recipient);
      setPhone(address.phone);
      setZipcode(address.zipcode);
      setRoadAddress(address.roadAddress);
      setDetailAddress(address.detailAddress);
      setIsDefault(address.isDefault);
    }
  }, [address]);

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="form-group">
        <label htmlFor="recipient">받는 사람:</label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          placeholder="받는 사람 이름을 입력하세요"
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">전화번호:</label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="zipcode">우편번호:</label>
        <input
          type="text"
          id="zipcode"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          required
          placeholder="우편번호를 입력하세요"
        />
        <button type="button" onClick={openAddressSearch}>
          우편번호 찾기
        </button>
      </div>
      <div className="form-group">
        <label htmlFor="roadAddress">도로명 주소:</label>
        <input
          type="text"
          id="roadAddress"
          value={roadAddress}
          onChange={(e) => setRoadAddress(e.target.value)}
          required
          placeholder="도로명 주소를 입력하세요"
        />
      </div>
      <div className="form-group">
        <label htmlFor="detailAddress">상세 주소:</label>
        <input
          type="text"
          id="detailAddress"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          required
          placeholder="상세 주소를 입력하세요 (예: 101동 102호)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="isDefault">
          기본 배송지로 설정
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={() => setIsDefault((prev) => !prev)}
          />
        </label>
      </div>
      <div className="form-buttons">
        <button type="submit">저장</button>
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </div>

      {/* Daum 주소 검색 모달 */}
      {isPostcodeVisible && (
        <div className="postcode-modal">
          <div className="modal-content">
            <DaumPostcode onComplete={handlePostcodeComplete} />
          </div>
        </div>
      )}
    </form>
  );
};

export default AddressForm;
