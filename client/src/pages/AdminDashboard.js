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

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
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
          navigate("/admin/dashboard");
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
      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      if (data.success) {
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
      const response = await fetch("http://localhost:5001/auth/users", {
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

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5001/shop", {
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
        {/* <ProductList products={products} />
        <MemberList members={members} /> */}
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
