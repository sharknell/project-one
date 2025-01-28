import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";
import "./AdminDashboard.css"; // CSS 파일 import

const AdminDashboard = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [qna, setQna] = useState([]); // State for Q&A
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("상품 등록 실패");
      }

      const data = await response.json();
      if (data.success) {
        setNewProduct(initialProductState);
        alert("상품이 성공적으로 등록되었습니다.");
        fetchProducts();
      } else {
        setError("상품 등록 실패");
      }
    } catch (err) {
      setError(err.message || "상품 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setMembers(data.users || []);
    } catch (err) {
      console.error("회원 조회 오류:", err);
      setMembers([]);
      setError("회원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/shop`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.message === "상품 목록 조회 성공" && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("상품 조회 오류:", err);
      setProducts([]);
      setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
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
      console.log("Q&A 응답 데이터:", data); // 응답 데이터 확인
      setQna(data.data || []); // 응답 데이터의 적절한 구조로 수정
    } catch (err) {
      console.error("Q&A 조회 오류:", err);
      setQna([]);
      setError("Q&A 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
      fetchMembers();
      fetchQna(); // Fetch Q&A data on component mount
    }
  }, [isAuthenticated, isAdmin]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (isAuthenticated && isAdmin) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-header">Admin Dashboard</h1>
        <div className="dashboard-section">
          <h2>상품 등록</h2>
          <ProductForm
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct}
          />
        </div>
        <div className="dashboard-section">
          <h2>상품 목록</h2>
          {products.length > 0 ? (
            <ul className="dashboard-list">
              {products.map((product) => (
                <li className="dashboard-list-item" key={product.id}>
                  {product.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty">상품이 없습니다.</p>
          )}
        </div>
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
        <div className="dashboard-section">
          <h2>Q&A 목록</h2>
          {qna.length > 0 ? (
            <ul className="dashboard-list">
              {qna.map((item) => (
                <li className="dashboard-list-item" key={item.id}>
                  <p>
                    <strong>질문:</strong> {item.question}
                  </p>
                  <p>
                    <strong>유저명:</strong> {item.userName || "답변 대기 중"}
                  </p>
                  <p>
                    <strong>답변:</strong> {item.answer || "답변 대기 중"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty">Q&A 목록이 없습니다.</p>
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
