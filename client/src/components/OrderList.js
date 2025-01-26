import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReviewModal from "./ReviewModal";
import "../styles/OrderList.css";
import { submitReview } from "../utils/api";

// 상태 라벨과 배송 라벨 상수 정의 (컴포넌트 외부)
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
  const [sortOption, setSortOption] = useState("latest"); // 기본 정렬 기준: 최신 순
  const itemsPerPage = 5; // 한 페이지에 표시할 주문 수

  // 페이지 변경 시 맨 위로 스크롤 처리
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // 핸들러 메모이제이션
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

  // 리뷰 제출 핸들러
  const handleReviewSubmit = async (reviewData) => {
    try {
      await submitReview("your-auth-token", reviewData); // token과 reviewData 전달
      alert("리뷰가 성공적으로 저장되었습니다!");
      closeReviewModal();
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      const errorMessage = error.response?.data?.message || "리뷰 저장 실패";
      alert(errorMessage);
    }
  };

  // 페이지네이션 계산 (useMemo 사용)
  const totalPages = useMemo(
    () => Math.ceil((orders?.length || 0) / itemsPerPage),
    [orders, itemsPerPage]
  );

  const paginatedOrders = useMemo(
    () =>
      orders?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [orders, currentPage, itemsPerPage]
  );

  // 주문 정렬
  const sortedOrders = useMemo(() => {
    if (sortOption === "latest") {
      return [...orders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortOption === "price") {
      return [...orders].sort((a, b) => b.amount - a.amount); // 가격 순으로 내림차순
    }
    return orders;
  }, [orders, sortOption]);

  // 상태와 배송 상태 라벨 처리 함수
  const getStatusLabel = (status) => STATUS_LABELS[status] || "알 수 없음";
  const getDeliveryStatusLabel = (deliveryStatus) =>
    DELIVERY_STATUS_LABELS[deliveryStatus] || "알 수 없음";

  // 주문 내역이 없는 경우
  if (!orders?.length) {
    return <p className="no-orders">주문 내역이 없습니다.</p>;
  }

  return (
    <div className="order-list-container">
      <h2>주문 내역</h2>
      <div className="order-list__sort">
        <select value={sortOption} onChange={handleSortChange}>
          <option value="latest">최신 순</option>
          <option value="price">가격 순</option>
        </select>
      </div>
      <ul className="order-list">
        {sortedOrders
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((order, index) => (
            <li key={order.order_id} className="order-list__item">
              <div className="order-list__header">
                <h3 className="order-list__id">주문 번호: {order.order_id}</h3>
                <span className="order-list__date">
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
                <p className="order-list__amount">
                  총 금액: ₩{order.amount.toLocaleString()}
                </p>
                <p className="order-list__status">
                  결제 상태: {getStatusLabel(order.status)}
                </p>
                <p className="order-list__delivery-status">
                  배송 상태: {getDeliveryStatusLabel(order.delivery_status)}
                </p>
              </div>
              <div className="order-list__items">
                <p>주문 제품 목록:</p>
                <ul className="product-list">
                  {order.cart_items.map((item, idx) => (
                    <li
                      key={`${order.order_id}-${item.productId}-${idx}`}
                      className="product-list__item"
                    >
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
              disabled={currentPage === pageNumber}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
      {isModalOpen && (
        <ReviewModal
          isOpen
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default OrderList;
