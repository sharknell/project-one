import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/QnAList.css";

const QnaList = ({ qnaData }) => {
  const [answers, setAnswers] = useState({});

  // 각 QnA에 대한 답변을 가져오는 함수
  const fetchAnswers = async (qnaId) => {
    try {
      const response = await axios.get(`/qna/${qnaId}/answers`);
      setAnswers((prev) => ({
        ...prev,
        [qnaId]: response.data.data,
      }));
    } catch (error) {
      console.error("답변을 불러오는 데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    // 모든 QnA에 대해 답변을 가져옴
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
            src={qna.productImage || "/default-product-image.jpg"}
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

            {/* 답변이 없으면 "아직 답변이 달리지 않았습니다." 메시지 표시 */}
            {answers[qna.id] && answers[qna.id].length > 0 ? (
              <div className="answers">
                <h4>답변:</h4>
                {answers[qna.id].map((answer) => (
                  <div key={answer.id} className="answer">
                    <div className="answer-user">답변자: {answer.userName}</div>
                    <div className="answer-text">{answer.answer}</div>
                    <div className="answer-date">
                      {new Date(answer.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-answer">아직 답변이 달리지 않았습니다.</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default QnaList;
