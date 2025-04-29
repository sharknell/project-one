import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PaymentCancel from "./components/toss-pay/PaymentCancel";
import PaymentFail from "./components/toss-pay/PaymentFail";
import PaymentSuccess from "./components/toss-pay/PaymentSuccess";
import QnAForm from "./components/QnAForm";
import { AuthProvider, useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";

// ProtectedRoute 컴포넌트
function ProtectedRoute({ children, redirectTo, requireAdmin = false }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />; // 일반 사용자는 홈으로 리디렉션
  }

  return children;
}

// App 컴포넌트
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main style={{ minHeight: "calc(100vh - 200px)" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/QnAForm" element={<QnAForm />} />

            {/* 어드민 페이지 경로 추가 */}
            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute redirectTo="/login" requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 결제 관련 페이지 */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
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
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
