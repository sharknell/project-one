import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const Admin = () => {
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
    imageUrl: "", // 상품 이미지 URL
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
      // 상품 등록 API 요청
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
        fetchProducts(); // 상품 목록 새로고침
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
      const response = await fetch("http://localhost:5001/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      setMembers(data.users);
    } catch (err) {
      console.error("회원 조회 오류:", err);
    }
  };

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error("상품 조회 오류:", err);
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

        {/* 상품 등록 폼 */}
        <h2>상품 등록</h2>
        <form onSubmit={handleAddProduct}>
          <div>
            <label>상품명</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>가격</label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>설명</label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>카테고리</label>
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>효과</label>
            <textarea
              value={newProduct.effect}
              onChange={(e) =>
                setNewProduct({ ...newProduct, effect: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>사이즈</label>
            <input
              type="text"
              value={newProduct.size}
              onChange={(e) =>
                setNewProduct({ ...newProduct, size: e.target.value })
              }
            />
          </div>
          <div>
            <label>재고</label>
            <input
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>배송 시간</label>
            <input
              type="text"
              value={newProduct.shippingTime}
              onChange={(e) =>
                setNewProduct({ ...newProduct, shippingTime: e.target.value })
              }
            />
          </div>
          <div>
            <label>반품 정책</label>
            <textarea
              value={newProduct.returnPolicy}
              onChange={(e) =>
                setNewProduct({ ...newProduct, returnPolicy: e.target.value })
              }
            />
          </div>
          <div>
            <label>향수 예술</label>
            <textarea
              value={newProduct.artOfPerfuming}
              onChange={(e) =>
                setNewProduct({ ...newProduct, artOfPerfuming: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>상세 정보</label>
            <textarea
              value={newProduct.detailedInfo}
              onChange={(e) =>
                setNewProduct({ ...newProduct, detailedInfo: e.target.value })
              }
            />
          </div>
          <div>
            <label>상품 이미지 URL</label>
            <input
              type="text"
              value={newProduct.imageUrl}
              onChange={(e) =>
                setNewProduct({ ...newProduct, imageUrl: e.target.value })
              }
            />
          </div>
          <button type="submit">상품 등록</button>
        </form>

        {/* 상품 목록 */}
        <h2>등록된 상품 목록</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - {product.price}원
            </li>
          ))}
        </ul>

        {/* 회원 목록 */}
        <h2>회원 목록</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.username} ({member.email})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Admin;
