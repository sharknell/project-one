import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";

const AdminDashboard = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
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

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

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
    }
  };

  // 상품 등록 처리 함수
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      if (data.success) {
        setNewProduct(initialProductState);
        alert("상품이 성공적으로 등록되었습니다.");
        fetchProducts();
      } else {
        setError("상품 등록 실패");
      }
    } catch (err) {
      setError("상품 등록 중 오류가 발생했습니다.");
    }
  };

  // 회원 목록 조회
  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      setMembers(data.users || []);
    } catch (err) {
      console.error("회원 조회 오류:", err);
      setMembers([]);
    }
  };

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      if (data.message === "상품 목록 조회 성공" && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("상품 조회 오류:", err);
      setProducts([]);
    }
  };

  // 어드민 대시보드 내용
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
      fetchMembers();
    }
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated && isAdmin) {
    return (
      <div>
        <h1>Welcome to the Admin Dashboard</h1>
        <ProductForm
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          handleAddProduct={handleAddProduct}
        />
        {/* 추가 기능: 상품 목록 및 회원 목록 */}
        <div>
          <h2>상품 목록</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>회원 목록</h2>
          <ul>
            {members.map((member) => (
              <li key={member.id}>{member.email}</li>
            ))}
          </ul>
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
