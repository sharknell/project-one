import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";
import AdminSidebar from "../components/AdminSidebar";
import QnaAdmin from "../components/QnaAdmin"; // 새로운 QnA 리스트 컴포넌트
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
  const [activeTab, setActiveTab] = useState("productForm");
  const [newProduct, setNewProduct] = useState({
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
  });

  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  // API 호출 함수 재사용
  const fetchData = async (url, method = "GET", body = null) => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: body ? JSON.stringify(body) : null,
      };
      const response = await fetch(`${API_BASE_URL}${url}`, options);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      setError("API 호출 중 오류가 발생했습니다.");
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchData("/auth/login", "POST", { email, password });
      if (data && data.token) {
        login(data.token);
        if (isAdmin) {
          navigate("/admindashboard");
        } else {
          setError("어드민 권한이 없습니다.");
        }
      } else {
        setError("로그인 실패");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Q&A와 회원 목록을 불러오는 함수
  const fetchQnaAndMembers = async () => {
    const qnaData = await fetchData("/qna/qna");
    setQna(qnaData ? qnaData.data : []);
    setFilteredQna(qnaData ? qnaData.data : []);

    const memberData = await fetchData("/auth/users");
    setMembers(memberData ? memberData.users : []);
  };

  // useEffect로 데이터 로드
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchQnaAndMembers();
    }
  }, [isAuthenticated, isAdmin]);

  // Q&A 필터링 함수
  const filterUnanswered = () =>
    setFilteredQna(qna.filter((item) => !item.answer));
  const sortNewestFirst = () =>
    setFilteredQna(
      [...qna].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  const sortOldestFirst = () =>
    setFilteredQna(
      [...qna].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );

  const handleAnswerSubmit = async (questionId, answer) => {
    if (!answer) return alert("답변을 입력해주세요.");
    try {
      const response = await fetchData("/qna/answer", "POST", {
        questionId,
        answer,
      });
      if (response && response.success) {
        alert("답변이 제출되었습니다.");
        fetchQnaAndMembers(); // 데이터 갱신
      } else {
        alert("답변 제출에 실패했습니다.");
      }
    } catch {
      alert("답변 제출 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중에는 로딩 화면만 보여줍니다
  if (loading) {
    return <div className="loader">Loading...</div>;
  }

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
                  전체 보기
                </button>
                <button className="filter-button" onClick={filterUnanswered}>
                  미답변 보기
                </button>
                <button className="filter-button" onClick={sortNewestFirst}>
                  최신 순
                </button>
                <button className="filter-button" onClick={sortOldestFirst}>
                  오래된 순
                </button>
              </div>
              <QnaAdmin qna={filteredQna} onAnswerSubmit={handleAnswerSubmit} />
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
        </div>
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
