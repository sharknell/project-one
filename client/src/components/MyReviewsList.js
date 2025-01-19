import React from "react";
import "./MyReviewsList.css"; // 외부 CSS로 스타일을 관리

const MyReviewsList = ({ reviews = [] }) => {
  return (
    <div className="reviews-container">
      <h2 className="title">내 리뷰 목록</h2>
      {reviews.length === 0 ? (
        <p className="no-reviews">작성된 리뷰가 없습니다.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              {/* 제품 이미지 추가 */}
              <img
                src={review.product_image_url}
                alt={review.product_name}
                className="product-image"
              />
              <h3 className="product-name">{review.product_name}</h3>
              <p className="review-text">{review.review_text}</p>
              <div className="review-footer">
                <span className="rating">{review.rating}점</span>
                <button className="edit-button">수정</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsList;
