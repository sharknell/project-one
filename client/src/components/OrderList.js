import React from "react";
import moment from "moment"; // moment.js 라이브러리 가져오기

const OrderList = ({ orders }) => {
  if (orders.length === 0) {
    return <p>주문 내역이 없습니다.</p>;
  }

  return (
    <div className="order-list">
      <ul>
        {orders.map((order) => {
          console.log(order.created_at); // created_at 값 확인

          let formattedDate;
          if (order.created_at) {
            // moment.js를 사용하여 MySQL DATETIME 형식 처리
            formattedDate = moment(order.created_at).format("YYYY-MM-DD"); // 원하는 형식으로 출력
          } else {
            formattedDate = "날짜 오류"; // created_at 값이 없을 경우
          }

          return (
            <li key={order.order_id}>
              <h3>주문 번호: {order.order_id}</h3>
              <p>주문 날짜: {formattedDate}</p>
              <p>총 금액: {order.amount}원</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderList;
