import { useEffect, useState } from "react";
import { fetchProducts } from "../models/ProductModel";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getProductById,
  fetchProductsByCategory,
} from "../models/ProductModel";
import axios from "axios";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5001/shop/product/${id}`
        );
        setProduct(response.data);
        if (response.data.images && response.data.images.length > 0) {
          setMainImage(
            `http://localhost:5001/uploads/productImages/${response.data.images[0]}`
          );
        }
      } catch (err) {
        setError(err.message || "제품 정보를 가져오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    const toggleDropdown = (index) => {
      setOpenDropdown((prevIndex) => (prevIndex === index ? null : index));
    };

    if (id) {
      fetchProduct();
    }
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
    setMainImage,
    handleThumbnailClick,
    handleButtonClick,
    toggleDropdown,
  };
};

export const loadProducts = async (
  category,
  setProducts,
  setError,
  setIsLoading,
  page,
  itemsPerPage
) => {
  setIsLoading(true);
  setError(null);

  if (!category) {
    setError("카테고리 정보가 없습니다.");
    setIsLoading(false);
    return;
  }

  try {
    const data = await fetchProductsByCategory(category, page, itemsPerPage);
    console.log("Response from server:", data); // 서버 응답 확인

    if (data.message === "상품 목록 조회 성공" && Array.isArray(data.data)) {
      if (data.data.length === 0) {
        setError("해당 카테고리의 상품이 없습니다.");
        setProducts([]); // 빈 배열 상태로 설정
      } else {
        setProducts(data.data);
      }
    } else if (data.message) {
      // `data.message`가 존재하면 그 메시지를 표시
      setError(data.message);
      setProducts([]); // 빈 배열 상태로 설정
    } else {
      setError("서버에서 잘못된 데이터 형식을 반환했습니다.");
    }
  } catch (error) {
    setError(error.message || "상품 목록을 불러오는 데 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};
