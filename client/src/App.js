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
import { AuthProvider, useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
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

            {/* 어드민 페이지 경로 추가 */}
            <Route path="/admindashboard" element={<AdminDashboard />} />

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
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
