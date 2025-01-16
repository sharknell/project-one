import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const AdminPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />; // 어드민이 아니라면 메인 페이지로 리디렉션
  }

  return <div>Welcome to the Admin Page!</div>;
};

export default AdminPage;
