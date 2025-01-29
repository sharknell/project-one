import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";
import AdminSidebar from "../components/AdminSidebar"; // AdminSidebar import
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [qna, setQna] = useState([]);
  const [filteredQna, setFilteredQna] = useState([]);
  const [answerModalVisible, setAnswerModalVisible] = useState(false); // 답변 모달의 상태
  const [selectedQuestion, setSelectedQuestion] = useState(null); // 선택된 질문
  const [answer, setAnswer] = useState(""); // 입력된 답변

  const initialProductState = {
    name: "",
    price: "",
    description: "",
    category: "",
    effect: "",
    size: "",
    stock: "",
    imageUrl: "",
    shippingTime: "",
    returnPolicy: "",
    artOfPerfuming: "",
    detailedInfo: "",
  };
  const [newProduct, setNewProduct] = useState(initialProductState);
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("로그인 실패: 올바르지 않은 자격 증명");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.token) {
        login(data.token);
        if (isAdmin) {
          navigate("/admindashboard");
        } else {
          setError("어드민 권한이 없습니다.");
        }
      } else {
        setError("로그인 실패");
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQna = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qna/qna`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Q&A 데이터:", data);
      setQna(data.data || []);
      setFilteredQna(data.data || []);
    } catch (err) {
      console.error("Q&A 조회 오류:", err);
      setQna([]);
      setError("Q&A 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filterUnanswered = () => {
    setFilteredQna(qna.filter((item) => !item.answer));
  };

  const sortNewestFirst = () => {
    setFilteredQna(
      [...qna].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  };

  const sortOldestFirst = () => {
    setFilteredQna(
      [...qna].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
  };

  const handleAnswerSubmit = async () => {
    if (!answer) {
      alert("답변을 입력해주세요.");
      return;
    }

    // 콘솔에 답변을 출력
    console.log("입력된 답변:", answer);
    console.log("선택된 질문:", selectedQuestion);
    console.log("질문 ID:", selectedQuestion.id);

    try {
      const response = await fetch(`${API_BASE_URL}/qna/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          answer,
        }),
      });

      if (response.ok) {
        alert("답변이 제출되었습니다.");
        setAnswerModalVisible(false);
        setAnswer(""); // 답변 초기화
        fetchQna(); // Q&A 목록 새로 고침
      } else {
        alert("답변 제출에 실패했습니다.");
      }
    } catch (err) {
      console.error("답변 제출 오류:", err);
      alert("답변 제출 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchQna();
    }
  }, [isAuthenticated, isAdmin]);

  const [activeTab, setActiveTab] = useState("productForm");

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  const openAnswerModal = (question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer || "");
    setAnswerModalVisible(true);
  };

  if (isAuthenticated && isAdmin) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="content">
          {activeTab === "productForm" && (
            <div className="dashboard-section">
              <h2>상품 등록</h2>
              <ProductForm
                newProduct={newProduct}
                setNewProduct={setNewProduct}
              />
            </div>
          )}

          {activeTab === "qnaAdmin" && (
            <div className="dashboard-section">
              <h2>Q&A 목록</h2>
              <div className="filter-buttons">
                <button
                  className="filter-button"
                  onClick={() => setFilteredQna(qna)}
                >
                  질문 전체보기
                </button>
                <button className="filter-button" onClick={filterUnanswered}>
                  미답변 보기
                </button>
                <button className="filter-button" onClick={sortNewestFirst}>
                  최신 순 보기
                </button>
                <button className="filter-button" onClick={sortOldestFirst}>
                  오래된 순 보기
                </button>
              </div>

              {filteredQna.length > 0 ? (
                <ul className="dashboard-list">
                  {filteredQna.map((item) => (
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
                            <strong>유저명:</strong>{" "}
                            {item.userName || "답변 대기 중"}
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
            </div>
          )}

          {activeTab === "members" && (
            <div className="dashboard-section">
              <h2>회원 목록</h2>
              {members.length > 0 ? (
                <ul className="dashboard-list">
                  {members.map((member) => (
                    <li className="dashboard-list-item" key={member.id}>
                      {member.email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty">회원이 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === "shippingAdmin" && (
            <div className="dashboard-section">
              <h2>제품 배송 상태 변경</h2>
              <p>배송 상태 변경 기능을 구현하세요.</p>
            </div>
          )}
        </div>

        {/* 답변 모달 */}
        {answerModalVisible && selectedQuestion && (
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
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="답변을 입력하세요..."
                />
                <div>
                  <button onClick={handleAnswerSubmit}>답변 제출</button>
                  <button onClick={() => setAnswerModalVisible(false)}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <LoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleLogin={handleLogin}
      error={error}
    />
  );
};

export default AdminDashboard;
