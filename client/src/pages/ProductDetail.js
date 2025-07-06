import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useProductController } from "../controllers/ProductController";
import axios from "axios";
import QnAForm from "../components/QnAForm";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userName } = useAuth();
  const [isQnAModalOpen, setIsQnAModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [subImages, setSubImages] = useState([]);
  const { product, isLoading, error, openDropdown, toggleDropdown } =
    useProductController(id);

  useEffect(() => {
    if (product) {
      setMainImage(product.image_url);
      setSubImages(product.images || []);
    }
  }, [product]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
    setSubImages([mainImage, ...subImages.filter((img) => img !== image)]);
  };

  const handleQnAClick = () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: window.location.pathname } });
      }
    } else {
      setIsQnAModalOpen(true);
    }
  };

  const handleQnASubmit = async (question) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:5001/qna/shop/product/${id}/qna`,
        { question, userName: userName || "익명", productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`QnA가 등록되었습니다: ${question}`);
    } catch (err) {
      console.error("QnA 등록 실패:", err);
      alert("질문 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: window.location.pathname } });
      }
    } else {
      try {
        if (!userId) {
          alert("사용자 정보가 유효하지 않습니다.");
          return;
        }
        const response = await axios.get(
          `http://localhost:5001/cart?userId=${userId}`
        );
        const cartItems = response.data;
        const existingItem = cartItems.find((item) => item.product_id === id);

        if (existingItem) {
          const updatedQuantity = existingItem.quantity + 1;
          await axios.put(`http://localhost:5001/cart/${existingItem.id}`, {
            quantity: updatedQuantity,
          });
          alert("장바구니에 품목의 수량이 추가되었습니다.");
        } else {
          const quantity = 1;
          const productName = product.name;
          const productSize = product.size || "없음";
          await axios.post("http://localhost:5001/cart/add", {
            productId: id,
            quantity,
            userId: userId,
            thumbnail: product.image_url,
            productName,
            productSize,
          });
          alert("장바구니에 추가되었습니다.");
        }
      } catch (err) {
        console.error("장바구니 추가 실패:", err);
        alert("장바구니에 추가하는 데 실패했습니다.");
      }
    }
  };

  if (isLoading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">제품 정보가 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-gray-600">{product.tagline}</p>
      </div>

      {/* Images and Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            {mainImage ? (
              <img
                src={`http://localhost:5001/uploads/productImages/${mainImage}`}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                메인 이미지가 없습니다.
              </div>
            )}
          </div>
          {subImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {subImages.map((img, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5001/uploads/productImages/${img}`}
                  alt={`서브 이미지 ${idx + 1}`}
                  className="h-24 w-full object-cover cursor-pointer rounded border hover:scale-105 transition"
                  onClick={() => handleThumbnailClick(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <hr />
          <p className="text-xl font-bold text-blue-600">
            ₩{product.price.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">카테고리:</span> {product.category}
          </p>
          <p>
            <span className="font-medium">사이즈:</span>{" "}
            {product.size || "없음"}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              장바구니 담기
            </button>
            <button
              onClick={handleQnAClick}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              QnA 등록하기
            </button>
          </div>
        </div>
      </div>

      {/* 상세정보 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">제품 상세 정보</h3>
        {["설명", "상품 필수 정보", "배송과 반품"].map((title, idx) => (
          <div key={idx} className="border-b">
            <button
              onClick={() => toggleDropdown(idx)}
              className="flex justify-between w-full py-3 text-left font-medium"
            >
              {title}
              <span>{openDropdown === idx ? "▲" : "▼"}</span>
            </button>
            {openDropdown === idx && (
              <div className="py-2 text-gray-700 text-sm">
                {idx === 0 ? (
                  <>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p>{product.description}</p>
                  </>
                ) : (
                  <p>내용이 준비 중입니다.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QnA Modal */}
      {isQnAModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow">
            <button
              onClick={() => setIsQnAModalOpen(false)}
              className="ml-auto mb-4 block text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <QnAForm
              onSubmit={handleQnASubmit}
              onCancel={() => setIsQnAModalOpen(false)}
              question={newQuestion}
              setQuestion={setNewQuestion}
              productId={id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
