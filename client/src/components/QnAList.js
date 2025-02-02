import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/QnAList.css";

const Answer = ({ answer, createdAt }) => (
  <div className="answer">
    <div className="answer-text">{answer}</div>
    <div className="answer-date">{new Date(createdAt).toLocaleString()}</div>
  </div>
);

const QnaList = ({ qnaData }) => {
  const [answers, setAnswers] = useState({});

  axios.defaults.baseURL = "http://localhost:5001";

  const fetchAnswers = async (qnaId) => {
    try {
      const response = await axios.get(`/qna/qna/${qnaId}/answers`);
      setAnswers((prev) => ({
        ...prev,
        [qnaId]: response.data.data.length > 0 ? response.data.data[0] : null,
      }));
    } catch (error) {
      console.error(`답변 조회 실패 (QnA ID: ${qnaId}):`, error);
      setAnswers((prev) => ({ ...prev, [qnaId]: null }));
    }
  };

  useEffect(() => {
    qnaData.forEach((qna) => {
      fetchAnswers(qna.id);
    });
  }, [qnaData]);

  if (!Array.isArray(qnaData) || qnaData.length === 0) {
    return <div className="no-data">QnA가 없습니다.</div>;
  }

  return (
    <ul className="qna-list">
      {qnaData.map((qna) => (
        <li key={qna.id}>
          <img
            src={qna.productImage || "/default-product.jpg"}
            alt="Product"
            className="product-image"
          />
          <div className="qna-content">
            <div className="question">{qna.question}</div>
            <div className="productId">제품 ID: {qna.productId}</div>
            <div className="qna-footer">
              <div className="createdAt">
                작성일: {new Date(qna.createdAt).toLocaleString()}
              </div>
            </div>
            {answers[qna.id] ? (
              <div className="answers">
                <h4>답변:</h4>
                <Answer
                  answer={answers[qna.id].answer}
                  createdAt={answers[qna.id].answerCreatedAt}
                />
              </div>
            ) : (
              <div className="no-answer">아직 답변이 없습니다.</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default QnaList;
