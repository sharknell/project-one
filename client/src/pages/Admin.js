import React, { useState } from "react";
import ProductForm from "../components/ProductForm"; // 제품 등록 폼 컴포넌트

const Admin = () => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  return (
    <div>
      <h1>Admin Page</h1>
      <button onClick={() => setIsAddingProduct(!isAddingProduct)}>
        {isAddingProduct ? "Hide Product Form" : "Add Product"}
      </button>
      {isAddingProduct && <ProductForm />}
      {/* 추후 다른 관리 기능 추가 가능 */}
    </div>
  );
};

export default Admin;
