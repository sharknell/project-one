import { useEffect, useState } from "react";
import { fetchProducts } from "../models/ProductModel";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getProductById,
  fetchProductsByCategory,
} from "../models/ProductModel";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  return { products, isLoading, error };
};
export const useProductController = (id) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { isAuthenticated } = useAuth(); // 로그인 상태 확인
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getProductById(id)
      .then((data) => {
        setProduct(data);
        setMainImage(data.images && data.images[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [id]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleButtonClick = (action) => {
    if (!isAuthenticated) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (action === "buy") {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[0] : "",
        quantity: 1,
        size: product.size || "없음",
      };

      const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      savedCart.push(cartItem);
      localStorage.setItem("cartItems", JSON.stringify(savedCart));
      navigate("/cart");
    } else if (action === "wishlist") {
      console.log("찜하기 클릭");
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return {
    product,
    isLoading,
    error,
    mainImage,
    openDropdown,
    handleThumbnailClick,
    handleButtonClick,
    toggleDropdown,
  };
};
export const loadProducts = async (
  category,
  setProducts,
  setError,
  setIsLoading
) => {
  setIsLoading(true);
  setError(null);

  if (!category) {
    setError("카테고리 정보가 없습니다.");
    setIsLoading(false);
    return;
  }

  try {
    const data = await fetchProductsByCategory(category);
    if (data.message === "상품 목록 조회 성공" && Array.isArray(data.data)) {
      setProducts(data.data);
    } else {
      setError("서버에서 잘못된 데이터 형식을 반환했습니다.");
    }
  } catch (error) {
    setError(error.message || "상품 목록을 불러오는 데 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};
