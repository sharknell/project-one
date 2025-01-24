import React from "react";

const ProductForm = ({ newProduct, setNewProduct, handleAddProduct }) => {
  return (
    <form onSubmit={handleAddProduct}>
      <div>
        <label>상품명</label>
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>가격</label>
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>설명</label>
        <textarea
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>카테고리</label>
        <input
          type="text"
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>효과</label>
        <textarea
          value={newProduct.effect}
          onChange={(e) =>
            setNewProduct({ ...newProduct, effect: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>사이즈</label>
        <input
          type="text"
          value={newProduct.size}
          onChange={(e) =>
            setNewProduct({ ...newProduct, size: e.target.value })
          }
        />
      </div>
      <div>
        <label>재고</label>
        <input
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>배송 시간</label>
        <input
          type="text"
          value={newProduct.shippingTime}
          onChange={(e) =>
            setNewProduct({ ...newProduct, shippingTime: e.target.value })
          }
        />
      </div>
      <div>
        <label>반품 정책</label>
        <textarea
          value={newProduct.returnPolicy}
          onChange={(e) =>
            setNewProduct({ ...newProduct, returnPolicy: e.target.value })
          }
        />
      </div>
      <div>
        <label>향수 예술</label>
        <textarea
          value={newProduct.artOfPerfuming}
          onChange={(e) =>
            setNewProduct({ ...newProduct, artOfPerfuming: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label>상세 정보</label>
        <textarea
          value={newProduct.detailedInfo}
          onChange={(e) =>
            setNewProduct({ ...newProduct, detailedInfo: e.target.value })
          }
        />
      </div>
      <div>
        <label>상품 이미지 URL</label>
        <input
          type="text"
          value={newProduct.imageUrl}
          onChange={(e) =>
            setNewProduct({ ...newProduct, imageUrl: e.target.value })
          }
        />
      </div>
      <button type="submit">상품 등록</button>
    </form>
  );
};

export default ProductForm;
