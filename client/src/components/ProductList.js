import React from "react";

const ProductList = ({ products }) => {
  return (
    <div>
      <h2>등록된 상품 목록</h2>
      <ul>
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <li key={product.id}>
              <img src={product.image_url} alt={product.name} />
              {product.name} - {product.price}원
            </li>
          ))
        ) : (
          <p>상품이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default ProductList;
