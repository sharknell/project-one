import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import ProductForm from "../components/ProductForm";
import "./AdminDashboard.css";

// 회원 팝업 컴포넌트
const MemberPopup = ({
  member,
  onClose,
  onSave,
  addresses,
  cart,
  payments,
}) => {
  const [editableMember, setEditableMember] = useState(member);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableMember({ ...editableMember, [name]: value });
  };

  const handleSave = () => {
    onSave(editableMember);
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>회원 상세 정보</h2>
        <div className="popup-content">
          <label>
            이름:
            <input
              type="text"
              name="name"
              value={editableMember.name || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            이메일:
            <input
              type="email"
              name="email"
              value={editableMember.email || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            권한:
            <input
              type="text"
              name="role"
              value={editableMember.role || ""}
              onChange={handleChange}
            />
          </label>

          <h3>주소 목록</h3>
          <ul>
            {addresses.map((address) => (
              <li key={address.id}>
                {address.roadAddress} ({address.recipient})
              </li>
            ))}
          </ul>

          <h3>장바구니</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.product_name} - {item.quantity}개
              </li>
            ))}
          </ul>

          <h3>결제 내역</h3>
          <ul>
            {payments.map((payment) => (
              <li key={payment.id}>
                {payment.order_name} - {payment.amount}원 (상태:{" "}
                {payment.status})
              </li>
            ))}
          </ul>
        </div>

        <div className="popup-actions">
          <button onClick={handleSave}>저장</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

// 어드민 대시보드 컴포넌트
const AdminDashboard = () => {
  const { login, isAdmin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null); // 선택된 회원
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState([]);
  const [payments, setPayments] = useState([]);

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

  // 특정 회원의 상세 데이터 로드
  const fetchMemberDetails = async (memberId) => {
    try {
      const [addressesRes, cartRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${memberId}/addresses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
        fetch(`${API_BASE_URL}/users/${memberId}/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
        fetch(`${API_BASE_URL}/users/${memberId}/payments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
      ]);

      setAddresses(await addressesRes.json());
      setCart(await cartRes.json());
      setPayments(await paymentsRes.json());
    } catch (err) {
      console.error("회원 상세 데이터 로드 오류:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
      fetchMembers();
    }
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated && isAdmin) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-header">어드민 대시보드</h1>

        {/* 상품 등록 섹션 */}
        <div className="section-container">
          <h2 className="section-header">상품 등록</h2>
          <ProductForm
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct}
          />
        </div>

        {/* 상품 목록 섹션 */}
        <div className="section-container">
          <h2 className="section-header">상품 목록</h2>
          <ul className="list-container">
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>

        {/* 회원 목록 섹션 */}
        <div className="section-container">
          <h2 className="section-header">회원 목록</h2>
          <ul className="list-container">
            {members.map((member) => (
              <li
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  fetchMemberDetails(member.id);
                }}
                className="list-item"
              >
                {member.email}
              </li>
            ))}
          </ul>
        </div>

        {/* 회원 팝업 */}
        {selectedMember && (
          <MemberPopup
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onSave={() => {}}
            addresses={addresses}
            cart={cart}
            payments={payments}
          />
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
