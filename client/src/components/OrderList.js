import React from "react";
// import "../styles/OrderList.css";

const OrderList = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <div>주문 내역이 없습니다.</div>;
  }

  return (
    <div className="order-list">
      <h2>주문 내역</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="order-item">
            <div>
              <strong>주문 번호:</strong> {order.id}
            </div>
            <div>
              <strong>주문 날짜:</strong>{" "}
              {new Date(order.date).toLocaleDateString()}
            </div>
            <div>
              <strong>총 금액:</strong> ₩{order.totalPrice.toLocaleString()}
            </div>
            <div>
              <strong>상품:</strong>{" "}
              {order.products.map((product) => (
                <span key={product.id}>
                  {product.name} ({product.quantity}개),{" "}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;
