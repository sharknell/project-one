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
import { AuthProvider } from "./AuthContext";

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
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-fail" element={<PaymentFail />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
