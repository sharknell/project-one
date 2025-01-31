import React, { useState } from "react";

const QnaAdmin = ({ qna, onAnswerSubmit }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState("");

  const openAnswerModal = (question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer || "");
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleSubmitAnswer = () => {
    if (!answer) {
      alert("답변을 입력해주세요.");
      return;
    }
    onAnswerSubmit(selectedQuestion.id, answer);
    setAnswer(""); // 답변 초기화
    setSelectedQuestion(null); // 질문 선택 초기화
  };

  return (
    <div>
      {qna.length > 0 ? (
        <ul className="dashboard-list">
          {qna.map((item) => (
            <li
              className="dashboard-list-item"
              key={item.id}
              onClick={() => openAnswerModal(item)} // 클릭 시 모달 열기
            >
              <div className="product-info">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt="Product"
                    className="product-image"
                  />
                )}
                <div>
                  <p>
                    <strong>질문:</strong> {item.question}
                  </p>
                  <p>
                    <strong>유저명:</strong> {item.userName || "답변 대기 중"}
                  </p>
                  <p>
                    <strong>작성일:</strong> {item.createdAt}
                  </p>
                  <div className="answer">
                    <strong>답변:</strong>{" "}
                    {item.answer ? (
                      item.answer
                    ) : (
                      <span className="no-answer">답변 대기 중</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-empty">Q&A 목록이 없습니다.</p>
      )}

      {selectedQuestion && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>답변 작성</h3>
            <div>
              <p>
                <strong>제품 명:</strong> {selectedQuestion.productName}
              </p>
              <p>
                <strong>제품 이미지:</strong>
              </p>
              {selectedQuestion.productImage && (
                <img
                  src={selectedQuestion.productImage}
                  alt="Product"
                  className="product-image"
                  style={{ width: "100px", height: "auto" }}
                />
              )}
              <p>
                <strong>질문 작성자:</strong> {selectedQuestion.userName}
              </p>
              <p>
                <strong>질문 작성일:</strong> {selectedQuestion.createdAt}
              </p>
              <p>
                <strong>질문:</strong> {selectedQuestion.question}
              </p>
              <textarea
                value={answer}
                onChange={handleAnswerChange}
                placeholder="답변을 입력하세요..."
              />
              <div>
                <button onClick={handleSubmitAnswer}>답변 제출</button>
                <button onClick={() => setSelectedQuestion(null)}>취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QnaAdmin;
