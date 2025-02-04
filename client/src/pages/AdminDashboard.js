import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";
import AdminSidebar from "../components/AdminSidebar";
import QnaAdmin from "../components/QnaAdmin";
import MemberList from "../components/MemberList";
import ProductList from "../components/ProductList"; // Import ProductList 컴포넌트
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [qna, setQna] = useState([]);
  const [filteredQna, setFilteredQna] = useState([]);
  const [activeTab, setActiveTab] = useState("productForm");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [editingProduct, setEditingProduct] = useState(null);
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
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  // 데이터 가져오기 (fetchData)
  const fetchData = useCallback(
    async (url, method = "GET", body = null) => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: body ? JSON.stringify(body) : null,
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
      } catch (error) {
        setError("API 호출 중 오류가 발생했습니다.");
        console.error(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  const fetchProducts = useCallback(async () => {
    const data = await fetchData("/shop");
    console.log("상품 데이터:", data); // 데이터 확인
    setProducts(data?.data || []); // data?.data로 상품 목록을 업데이트
  }, [fetchData]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
    }
  }, [isAuthenticated, isAdmin, fetchProducts]);

  // 상품 등록 처리
  const handleSubmit = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();
      console.log(data); // 응답 데이터 확인

      if (response.ok && data.message === "상품이 성공적으로 추가되었습니다.") {
        alert("상품이 성공적으로 등록되었습니다.");
        setNewProduct({
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
      } else {
        console.log("서버 응답 실패:", data);
        alert("상품 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 등록 오류:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  // 제품 편집
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      // 편집 폼에 필요한 추가 필드가 있을 경우 여기에 추가
    });
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const data = await fetchData("/auth/login", "POST", credentials);
    if (data?.token) {
      login(data.token);
      isAdmin
        ? navigate("/admindashboard")
        : setError("어드민 권한이 없습니다.");
    } else {
      setError("로그인 실패");
    }
  };

  // Q&A 및 회원 목록 불러오기
  const fetchQnaAndMembers = useCallback(async () => {
    const [qnaData, memberData] = await Promise.all([
      fetchData("/qna/qna"),
      fetchData("/auth/users"),
    ]);
    setQna(qnaData?.data || []);
    setFilteredQna(qnaData?.data || []);
    setMembers(memberData?.users || []);
  }, [fetchData]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchQnaAndMembers();
    }
  }, [isAuthenticated, isAdmin, fetchQnaAndMembers]);

  // Q&A 필터링
  const handleFilterChange = (filterType) => {
    const filters = {
      all: () => setFilteredQna(qna),
      unanswered: () => setFilteredQna(qna.filter((item) => !item.answer)),
      newest: () =>
        setFilteredQna(
          [...qna].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        ),
      oldest: () =>
        setFilteredQna(
          [...qna].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        ),
    };
    filters[filterType]?.();
  };

  // 제품 삭제
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shop/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        console.log("제품 삭제 성공:" + response);
        alert("제품이 삭제되었습니다.");
        fetchProducts(); // 삭제 후 제품 목록을 다시 가져옵니다.
      } else {
        alert("제품 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("제품 삭제 중 오류가 발생했습니다.");
    }
  };

  // 답변 제출
  const handleAnswerSubmit = async (questionId, answer) => {
    if (!answer) return alert("답변을 입력해주세요.");
    const response = await fetchData("/qna/qna/answer", "POST", {
      questionId,
      answer,
    });
    response?.success
      ? alert("답변이 제출되었습니다.")
      : alert("답변 제출 실패");
    fetchQnaAndMembers();
  };

  if (loading) return <div className="loader">Loading...</div>;

  if (!isAuthenticated || !isAdmin) {
    return (
      <LoginForm
        {...credentials}
        setCredentials={setCredentials}
        handleLogin={handleLogin}
        error={error}
      />
    );
  }

  const tabContent = {
    productForm: (
      <ProductForm
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleSubmit={handleSubmit}
      />
    ),
    productList: (
      <ProductList
        products={products}
        API_BASE_URL={API_BASE_URL}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    ), // ProductList 컴포넌트 사용
    qnaAdmin: (
      <div className="dashboard-section">
        <h2>Q&A 목록</h2>
        <div className="filter-buttons">
          {["all", "unanswered", "newest", "oldest"].map((filter) => (
            <button
              key={filter}
              className="filter-button"
              onClick={() => handleFilterChange(filter)}
            >
              {filter === "all"
                ? "전체 보기"
                : filter === "unanswered"
                ? "답변 대기 중"
                : filter === "newest"
                ? "최신 순"
                : "오래된 순"}
            </button>
          ))}
        </div>
        <QnaAdmin qna={filteredQna} onAnswerSubmit={handleAnswerSubmit} />
      </div>
    ),
    members: <MemberList members={members} />,
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content">{tabContent[activeTab]}</div>
    </div>
  );
};

export default AdminDashboard;
