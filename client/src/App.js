import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PaymentCancel from "./components/PaymentCancel";
import PaymentFail from "./components/PaymentFail";
import PaymentSuccess from "./components/PaymentSuccess";
import QnAForm from "./components/QnAForm";
import AdminPage from "./pages/Admin"; // 어드민 페이지 임포트
import { AuthProvider, useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

// ProtectedRoute 컴포넌트 수정
function ProtectedRoute({ children, redirectTo }) {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중이거나 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (isLoading) {
    return <div>Loading...</div>; // 로딩 중일 때 로딩 화면을 보여줄 수 있습니다.
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main style={{ minHeight: "calc(100vh - 200px)" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/shop/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/QnAForm" element={<QnAForm />} />

            {/* 결제 관련 페이지 */}
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute redirectTo="/login">
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-fail"
              element={
                <ProtectedRoute redirectTo="/login">
                  <PaymentFail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-cancel"
              element={
                <ProtectedRoute redirectTo="/login">
                  <PaymentCancel />
                </ProtectedRoute>
              }
            />

            {/* 어드민 페이지 추가 */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute redirectTo="/login">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
