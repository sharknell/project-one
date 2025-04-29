import React from "react";
import "../../styles/AddressList.css";

const AddressList = ({ addresses = [], onEditAddress }) => {
  return (
    <div className="address-list-container">
      <h2 className="address-list-title">배송지 관리</h2>
      {addresses.length === 0 ? (
        <p className="no-address-message">등록된 주소가 없습니다.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((address) => (
            <li key={address.id} className="address-item">
              <div className="address-info">
                <p className="address-recipient">{`받는 사람: ${address.recipient}`}</p>
                <p className="address-phone">{`전화번호: ${address.phone}`}</p>
                <p className="address-zipcode">{`우편번호: ${address.zipcode}`}</p>
                <p className="address-road">{`도로명 주소: ${address.roadAddress}`}</p>
                <p className="address-detail">{`상세 주소: ${address.detailAddress}`}</p>
                {address.isDefault && (
                  <span className="default-tag">(기본 배송지)</span>
                )}
              </div>
              <div className="address-actions">
                <button
                  className="address-edit-button"
                  onClick={() => onEditAddress(address)} // 수정 버튼 클릭 시 주소와 함께 함수 호출
                >
                  수정
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressList;
