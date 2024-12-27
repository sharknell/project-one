import React, { useState, useEffect } from "react";
import axios from "axios";

function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    axios.get(`http://localhost:5000/reviews/${productId}`)
      .then((response) => setReviews(response.data))
      .catch((error) => console.error(error));
  }, [productId]);

  const submitReview = () => {
    axios.post("http://localhost:5000/reviews", { productId, review: newReview, rating })
      .then(() => {
        setReviews([...reviews, { review: newReview, rating }]);
        setNewReview("");
        setRating(5);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h1>Reviews</h1>
      <ul>
        {reviews.map((r, index) => (
          <li key={index}>
            <p>{r.review}</p>
            <p>Rating: {r.rating}/5</p>
          </li>
        ))}
      </ul>
      <textarea
        placeholder="Write your review"
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
      />
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <button onClick={submitReview}>Submit</button>
    </div>
  );
}

export default Reviews;
