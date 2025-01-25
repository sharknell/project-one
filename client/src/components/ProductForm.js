import React from "react";
import "./ProductForm.css";

const ProductForm = ({ newProduct, setNewProduct, handleAddProduct }) => {
  return (
    <form onSubmit={handleAddProduct} className="form-container">
      <h2>상품 등록</h2>
      {Object.keys(newProduct).map((key) => (
        <div key={key} className="input-group">
          <label htmlFor={key}>{key}</label>
          {key === "description" ||
          key === "effect" ||
          key === "returnPolicy" ||
          key === "artOfPerfuming" ||
          key === "detailedInfo" ? (
            <textarea
              id={key}
              value={newProduct[key]}
              onChange={(e) =>
                setNewProduct({ ...newProduct, [key]: e.target.value })
              }
              required={key !== "size" && key !== "imageUrl"}
            />
          ) : (
            <input
              id={key}
              type={key === "price" || key === "stock" ? "number" : "text"}
              value={newProduct[key]}
              onChange={(e) =>
                setNewProduct({ ...newProduct, [key]: e.target.value })
              }
              required={key !== "size" && key !== "imageUrl"}
            />
          )}
        </div>
      ))}
      <button type="submit" className="submit-btn">
        상품 등록
      </button>
    </form>
  );
};

export default ProductForm;
