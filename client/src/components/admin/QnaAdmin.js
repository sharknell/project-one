import React, { useState } from "react";

const QnaAdmin = ({ qna, onAnswerSubmit, onAnswerDelete }) => {
  console.log("QnaAdmin props:", qna);

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null); // 수정 중인 답변의 id

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleSubmitAnswer = (questionId) => {
    if (!answer) {
      alert("답변을 입력해주세요.");
      return;
    }
    console.log("답변 제출:", questionId, answer);
    onAnswerSubmit(questionId, answer);

    setAnswer(""); // 답변 초기화
    setSelectedQuestionId(null); // 질문 선택 초기화
  };

  const handleEditAnswer = (answerId, currentAnswer) => {
    setEditingAnswerId(answerId); // 수정할 답변 id 설정
    setAnswer(currentAnswer); // 기존 답변을 수정 폼에 로드
  };

  const handleDeleteAnswer = (answerId) => {
    if (window.confirm("이 답변을 삭제하시겠습니까?")) {
      onAnswerDelete(answerId); // 답변 삭제 처리
    }
  };

  return (
    <div>
      {qna.length > 0 ? (
        <ul className="dashboard-list">
          {qna.map((item) => (
            <li className="dashboard-list-item" key={item.id}>
              <div className="product-info">
                {/* 상품 이미지가 있을 경우 출력 */}
                {item.productImage ? (
                  <img
                    src={`http://localhost:5001/uploads/productImages/${item.productImage}`} // 서버 경로에 맞게 설정
                    alt="Product"
                    className="product-image"
                    style={{ width: "100px", height: "auto" }}
                  />
                ) : (
                  <span>이미지 없음</span> // 이미지가 없으면 대체 텍스트
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
                      <span>{item.answer}</span>
                    ) : (
                      <span className="no-answer">답변 대기 중</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 답변 작성 또는 수정 영역 */}
              {selectedQuestionId === item.id && (
                <div className="answer-form">
                  <textarea
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="답변을 입력하세요..."
                  />
                  <div>
                    <button onClick={() => handleSubmitAnswer(item.id)}>
                      답변 제출
                    </button>
                    <button onClick={() => setSelectedQuestionId(null)}>
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 답변 수정 영역 */}
              {editingAnswerId === item.id && (
                <div className="answer-form">
                  <textarea
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="답변을 수정하세요..."
                  />
                  <div>
                    <button onClick={() => handleSubmitAnswer(item.id)}>
                      수정 제출
                    </button>
                    <button
                      onClick={() => {
                        setEditingAnswerId(null);
                        setAnswer(""); // 수정 취소
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 답변 수정 및 삭제 버튼 */}
              {item.answer && editingAnswerId !== item.id && (
                <div>
                  <button
                    onClick={() => handleEditAnswer(item.id, item.answer)}
                  >
                    답변 수정
                  </button>
                  <button onClick={() => handleDeleteAnswer(item.id)}>
                    답변 삭제
                  </button>
                </div>
              )}

              {/* 답변 작성 버튼 */}
              {selectedQuestionId !== item.id && !item.answer && (
                <button onClick={() => setSelectedQuestionId(item.id)}>
                  답변 작성
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-empty">Q&A 목록이 없습니다.</p>
      )}
    </div>
  );
};

export default QnaAdmin;
