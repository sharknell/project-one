// ShippingManagement.js
import React from "react";

const ShippingManagement = ({
  shippingAddresses,
  newAddress,
  handleNewAddressChange,
  addShippingAddress,
  removeShippingAddress,
  setDefaultShippingAddress,
}) => {
  return (
    <div className="shipping-management">
      <h3>배송지 관리</h3>
      <div>
        <input
          type="text"
          placeholder="시"
          name="province"
          value={newAddress.province}
          onChange={handleNewAddressChange}
        />
        <input
          type="text"
          placeholder="군/구"
          name="city"
          value={newAddress.city}
          onChange={handleNewAddressChange}
        />
        <input
          type="text"
          placeholder="동/읍"
          name="district"
          value={newAddress.district}
          onChange={handleNewAddressChange}
        />
        <input
          type="text"
          placeholder="도로명"
          name="street"
          value={newAddress.street}
          onChange={handleNewAddressChange}
        />
        <input
          type="text"
          placeholder="상세 주소"
          name="detail"
          value={newAddress.detail}
          onChange={handleNewAddressChange}
        />
        <button onClick={addShippingAddress}>배송지 추가</button>
      </div>
      <ul>
        {shippingAddresses.map((address) => (
          <li key={address._id}>
            <span>{`${address.province} ${address.city} ${address.district} ${address.street} ${address.detail}`}</span>
            {address.default && <span> (기본 배송지)</span>}
            <button onClick={() => removeShippingAddress(address._id)}>
              삭제
            </button>
            {!address.default && (
              <button onClick={() => setDefaultShippingAddress(address._id)}>
                기본 배송지로 설정
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShippingManagement;
