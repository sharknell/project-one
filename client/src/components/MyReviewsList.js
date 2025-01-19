import React from "react";
import "./MyReviewsList.css"; // 외부 CSS로 스타일을 관리

const MyReviewsList = ({ reviews = [] }) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return <div className="no-reviews">작성한 리뷰가 없습니다.</div>; // 리뷰가 없으면 메시지 출력
  }

  return (
    <div className="reviews-container">
      <h2 className="title">내 리뷰 목록</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div className="review-card" key={review.id}>
            <img
              src={review.product_image_url || "/default-product-image.jpg"} // 이미지가 없으면 기본 이미지로 대체
              alt={review.product_name}
              className="product-image"
            />
            <h3 className="product-name">{review.product_name}</h3>
            <p className="review-text">
              {review.review_text || "리뷰 내용이 없습니다."}
            </p>
            <div className="review-footer">
              <span className="rating">{review.rating || "0"}점</span>
              <button className="edit-button">수정</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReviewsList;
