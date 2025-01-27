import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReviewModal from "./ReviewModal"; // 리뷰 모달 컴포넌트
import "../styles/OrderList.css"; // 스타일 파일
import { submitReview } from "../utils/api"; // 리뷰 제출 API 호출 함수

const STATUS_LABELS = {
  pending: "결제 대기 중",
  success: "결제 성공",
  failed: "결제 실패",
  canceled: "결제 취소",
};

const DELIVERY_STATUS_LABELS = {
  preparing: "배송 준비 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  canceled: "배송 취소",
};

const OrderList = ({ orders }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("latest"); // 기본 정렬 기준
  const itemsPerPage = 5; // 페이지당 아이템 수

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const openReviewModal = useCallback((product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  const closeReviewModal = useCallback(() => {
    setSelectedProduct(null);
    setModalOpen(false);
  }, []);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await submitReview("your-auth-token", reviewData);
      alert("리뷰가 성공적으로 저장되었습니다!");
      closeReviewModal();
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      alert(error.response?.data?.message || "리뷰 저장 실패");
    }
  };

  const totalPages = useMemo(
    () => Math.ceil((orders?.length || 0) / itemsPerPage),
    [orders, itemsPerPage]
  );

  const sortedOrders = useMemo(() => {
    if (sortOption === "latest") {
      return [...orders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortOption === "oldest") {
      return [...orders].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortOption === "price_high") {
      return [...orders].sort((a, b) => b.amount - a.amount); // 가격 내림차순
    } else if (sortOption === "price_low") {
      return [...orders].sort((a, b) => a.amount - b.amount); // 가격 오름차순
    }
    return orders;
  }, [orders, sortOption]);

  const paginatedOrders = useMemo(
    () =>
      sortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [sortedOrders, currentPage, itemsPerPage]
  );

  const getStatusLabel = (status) => STATUS_LABELS[status] || "알 수 없음";
  const getDeliveryStatusLabel = (deliveryStatus) =>
    DELIVERY_STATUS_LABELS[deliveryStatus] || "알 수 없음";

  if (!orders?.length) {
    return <p className="no-orders">주문 내역이 없습니다.</p>;
  }

  return (
    <div className="order-list-container">
      <h2>주문 내역</h2>
      <div className="order-list__sort">
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="order-list__sort-select"
        >
          <option value="latest">최신 순</option>
          <option value="oldest">오래된 순</option>
          <option value="price_high">가격 (비싼 순)</option>
          <option value="price_low">가격 (낮은 순)</option>
        </select>
      </div>
      <ul className="order-list">
        {paginatedOrders.map((order) => (
          <li key={order.order_id} className="order-list__item">
            <div className="order-list__header">
              <h3>주문 번호: {order.order_id}</h3>
              <span>
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
              <p>총 금액: ₩{order.amount.toLocaleString()}</p>
              <p>결제 상태: {getStatusLabel(order.status)}</p>
              <p>배송 상태: {getDeliveryStatusLabel(order.delivery_status)}</p>
            </div>
            <ul className="product-list">
              {order.cart_items.map((item) => (
                <li key={item.productId} className="product-list__item">
                  <div className="product-info">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="product-thumbnail"
                      />
                    )}
                    <div>
                      <p>{item.productName}</p>
                      <p>수량: {item.quantity}</p>
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
                      리뷰 작성
                    </button>
                  )}
                </li>
              ))}
            </ul>
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
