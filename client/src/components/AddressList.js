import React from "react";

const AddressList = ({ addresses, onEdit, onDelete }) => {
  console.log("주소 목록:", addresses); // 전달되는 주소 목록 확인

  return (
    <div className="address-list">
      <h2>배송지 목록</h2>
      {addresses.length === 0 ? (
        <p>등록된 배송지가 없습니다.</p>
      ) : (
        <ul>
          {addresses.map((address, index) => (
            <li key={index} className="address-item">
              <p>
                <strong>주소 :</strong> {address.street}, {address.city},{" "}
                {address.state}, {address.zip}
              </p>
              <div className="address-actions">
                <button onClick={() => onEdit(address)} className="edit-btn">
                  편집하기
                </button>
                <button
                  onClick={() => onDelete(address)}
                  className="delete-btn"
                >
                  삭제하기
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
