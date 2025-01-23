import React, { useState } from "react";
import ReviewModal from "./ReviewModal";
import "../styles/OrderList.css";
import { submitReview } from "../utils/api";

const OrderList = ({ orders }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 표시할 주문 수

  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedProduct(null);
    setModalOpen(false);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await submitReview("your-auth-token", reviewData); // token과 reviewData 전달
      alert("리뷰가 성공적으로 저장되었습니다!");
      closeReviewModal();
    } catch (error) {
      alert(error.message || "리뷰 저장 실패");
    }
  };

  const totalPages = Math.ceil((orders?.length || 0) / itemsPerPage);
  const paginatedOrders = orders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!orders || orders.length === 0) {
    return <p className="no-orders">주문 내역이 없습니다.</p>;
  }

  return (
    <div className="order-list-container">
      <h2>주문 내역</h2>
      <ul className="order-list">
        {paginatedOrders.map((order) => (
          <li key={order.order_id} className="order-item">
            <div className="order-header">
              <h3 className="order-id">주문 번호: {order.order_id}</h3>
              <span className="order-date">
                주문 시간:{" "}
                {new Date(order.created_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <p className="order-amount">
                총 금액: ₩{order.amount.toLocaleString()}
              </p>
            </div>
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
                        <p className="product-id">제품 ID: {item.productId}</p>
                        <p className="product-quantity">
                          수량: {item.quantity}
                        </p>
                      </div>
                    </div>
                    {order.delivery_status === "delivered" && (
                      <button
                        className="review-submit-button"
                        onClick={() =>
                          openReviewModal({
                            productId: item.productId,
                            productName: item.productName,
                            thumbnail: item.thumbnail,
                          })
                        }
                      >
                        리뷰 작성하기
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`pagination-button ${
                currentPage === pageNumber ? "active" : ""
              }`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
      {isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default OrderList;
