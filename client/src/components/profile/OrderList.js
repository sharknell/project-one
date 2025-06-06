import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReviewModal from "./ReviewModal";
import "../../styles/OrderList.css";
import { submitReview } from "../../utils/api";

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
  const [sortOption, setSortOption] = useState("latest");
  const itemsPerPage = 5;

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
    [orders]
  );

  const sortedOrders = useMemo(() => {
    const sorted = [...orders];
    switch (sortOption) {
      case "latest":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case "price_high":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "price_low":
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return orders;
    }
  }, [orders, sortOption]);

  const paginatedOrders = useMemo(() => {
    return sortedOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedOrders, currentPage]);

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
        {paginatedOrders.map((order) => {
          const firstItem = order.cart_items[0];
          const otherItemsCount = order.cart_items.length - 1;
          const totalQuantity = order.cart_items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return (
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
                <p>총 수량: {totalQuantity}개</p>
                <p>결제 상태: {getStatusLabel(order.status)}</p>
                <p>
                  배송 상태: {getDeliveryStatusLabel(order.delivery_status)}
                </p>
              </div>

              <div className="product-summary">
                <img
                  src={
                    firstItem?.thumbnail
                      ? `http://localhost:5001/uploads/productImages/${firstItem.thumbnail}`
                      : `http://localhost:5001/uploads/productImages/default-image.jpg`
                  }
                  alt={firstItem?.productName || "기본 이미지"}
                  className="product-thumbnail"
                />
                <div className="product-summary__info">
                  <p>{firstItem?.productName}</p>
                  {otherItemsCount > 0 && <p>외 {otherItemsCount}개</p>}
                </div>

                {order.delivery_status === "delivered" && (
                  <button
                    className="review-submit-button"
                    onClick={() =>
                      openReviewModal({
                        productId: firstItem.productId,
                        productName: firstItem.productName,
                        thumbnail: firstItem.thumbnail,
                      })
                    }
                  >
                    리뷰 작성
                  </button>
                )}
              </div>
            </li>
          );
        })}
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
