import React, { useState } from "react";
import { useAuth } from "../AuthContext"; // 인증 상태를 관리하는 훅을 불러옵니다.
import "./QnAForm.css";

function QnAForm({ onSubmit, onCancel, question, setQuestion, productId }) {
  const { userName } = useAuth(); // 인증된 사용자 이름을 가져옵니다.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setQuestion(e.target.value); // 질문 입력 상태 업데이트
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      setIsSubmitting(true);
      onSubmit(question, productId, userName); // userName을 제대로 전달
      setQuestion(""); // 제출 후 입력란 초기화
      setIsSubmitting(false);
    }
  };

  return (
    <div className="qna-form-container">
      <h2>QnA 등록</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="qna-textarea"
          placeholder="질문을 입력하세요"
          value={question}
          onChange={handleInputChange}
          rows="4"
        />
        <div className="qna-form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            취소
          </button>
          <button
            type="submit"
            className={`submit-button ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting || !question.trim()}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QnAForm;
