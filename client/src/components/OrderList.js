import React, { useEffect, useState } from "react";
import axios from "axios";
// import "../styles/OrderList.css";

const ERROR_MESSAGES = {
  orders: "주문 내역을 가져오는 중 오류가 발생했습니다.",
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:5001/profile/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(response.data.orders);
      } catch (err) {
        setError(ERROR_MESSAGES.orders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-list">
      <h2>주문 내역</h2>
      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <p>주문 ID: {order.id}</p>
              <p>상품명: {order.productName}</p>
              <p>수량: {order.quantity}</p>
              <p>총 금액: {order.totalPrice}원</p>
              <p>주문 날짜: {new Date(order.orderDate).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderList;
