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

function ProtectedRoute({ element, redirectTo }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return element;
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
                <ProtectedRoute
                  element={<PaymentSuccess />}
                  redirectTo="/login"
                />
              }
            />
            <Route
              path="/payment-fail"
              element={
                <ProtectedRoute element={<PaymentFail />} redirectTo="/login" />
              }
            />
            <Route
              path="/payment-cancel"
              element={
                <ProtectedRoute
                  element={<PaymentCancel />}
                  redirectTo="/login"
                />
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
