import React, { useState } from "react";
import ReviewModal from "./ReviewModal";
import "./OrderList.css";

const OrderList = ({ orders, onSubmitReview }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const ordersPerPage = 5;

  if (!orders || orders.length === 0) {
    return <p className="no-orders">주문 내역이 없습니다.</p>;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedProduct(null);
    setIsReviewModalOpen(false);
  };

  return (
    <div className="order-list-container">
      <h2>주문 내역</h2>
      <ul className="order-list">
        {currentOrders.map((order) => {
          const formattedDate = order.created_at
            ? new Date(order.created_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "날짜 오류";

          return (
            <li key={order.order_id} className="order-item">
              <div className="order-header">
                <h3 className="order-id">주문 번호: {order.order_id}</h3>
                <span className="order-date">주문 시간: {formattedDate}</span>
                <p className="order-amount">
                  총 금액: ₩{order.amount.toLocaleString()}
                </p>
                <p
                  className={`delivery-status ${
                    order.delivery_status || "미정"
                  }`}
                >
                  배송 상태:{" "}
                  {order.delivery_status === "preparing"
                    ? "배송 준비 중"
                    : order.delivery_status === "delivered"
                    ? "배송 완료"
                    : "배송 상태 미정"}
                </p>
                <p className={`payment-status ${order.status}`}>
                  결제 상태:{" "}
                  {order.status === "success" ? "결제 완료" : "결제 대기 중"}
                </p>
              </div>

              {order.cart_items && order.cart_items.length > 0 && (
                <div className="order-items">
                  <p>주문 제품 목록:</p>
                  <ul className="product-list">
                    {order.cart_items.map((item) => (
                      <li key={item.productId} className="product-item">
                        <div className="product-info">
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={`Product ${item.productId}`}
                              className="product-thumbnail"
                            />
                          )}
                          <div className="product-details">
                            <p className="product-name">{item.productName}</p>
                            <p className="product-size">{item.productSize}</p>
                            <p className="product-id">
                              제품 ID: {item.productId}
                            </p>
                            <p className="product-quantity">
                              수량: {item.quantity}
                            </p>
                          </div>
                        </div>
                        {order.delivery_status === "delivered" && (
                          <div className="review-section">
                            <button
                              className="review-submit-button"
                              onClick={() => openReviewModal(item)}
                            >
                              리뷰 작성하기
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(orders.length / ordersPerPage) },
          (_, index) => (
            <button
              key={index + 1}
              className={`page-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          onSubmit={(reviewData) => {
            onSubmitReview(reviewData);
            closeReviewModal();
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default OrderList;
