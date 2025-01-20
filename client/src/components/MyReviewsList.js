import React from "react";
import "../styles/MyReviewsList.css";

const MyReviewsList = ({ reviews = [] }) => {
  // 리뷰 데이터 형식이 잘못된 경우
  if (!Array.isArray(reviews)) {
    return (
      <div className="error-message">
        리뷰 데이터 형식에 오류가 발생했습니다.
      </div>
    );
  }

  // 리뷰가 없는 경우
  if (reviews.length === 0) {
    return <div className="no-reviews">작성한 리뷰가 없습니다.</div>;
  }

  return (
    <div className="reviews-container">
      <h2 className="title">내 리뷰 목록</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div className="review-card" key={review.id}>
            <img
              src={review.thumbnail || "/default-product-image.jpg"}
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
