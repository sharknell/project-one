import React from "react";
import "../styles/AddressList.css";

const AddressList = ({ addresses, setAddressToEdit, handleAddressDelete }) => {
  return (
    <div className="address-list-container">
      <h2 className="address-list-title">배송지 관리</h2>
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
                onClick={() => setAddressToEdit(address)}
              >
                수정
              </button>
              <button
                className="address-delete-button"
                onClick={() => handleAddressDelete(address)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressList;
