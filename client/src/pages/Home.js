import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../controllers/ProductController";
import bpicture1 from "../banner/shoppingmallbanner.jpg";
import bpicture2 from "../banner/shoppingmallbannerSub.jpg";
import bpicture3 from "../banner/shoppingmallbannerSub2.jpg";
import c1 from "../banner/c1.jpg";
import c2 from "../banner/c2.jpg";
import c3 from "../banner/c3.jpg";

function Home() {
  const { products, isLoading, error } = useProducts(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerImages = [c1, c2, c3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-lg aspect-[3/1]">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {bannerImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Banner ${index + 1}`}
              className="min-w-full object-cover"
            />
          ))}
        </div>
        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {bannerImages.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Banner */}
      <div className="relative">
        <img
          src={bpicture1}
          alt="Perfume Collection"
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end text-white pb-6">
          <h2 className="text-xl md:text-3xl font-bold mb-3">
            향수의 향기를 느껴보세요
          </h2>
          <Link
            to="/shop?category=perfume"
            className="inline-flex items-center gap-1 bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition"
          >
            향수 라인업 보기 →
          </Link>
        </div>
      </div>

      {/* Sub Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left */}
        <div className="relative group">
          <img
            src={bpicture2}
            alt="메이크업"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end items-center text-white p-4 opacity-0 group-hover:opacity-100 transition">
            <h3 className="text-lg font-semibold mb-1">매력적인 당신을 위한</h3>
            <p className="text-sm mb-2">메이크업으로 변화를 주다</p>
            <Link
              to="/shop?category=makeup"
              className="inline-flex items-center gap-1 bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              메이크업 라인업 보기 →
            </Link>
          </div>
        </div>
        {/* Right */}
        <div className="relative group">
          <img
            src={bpicture3}
            alt="스킨케어"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end items-center text-white p-4 opacity-0 group-hover:opacity-100 transition">
            <h3 className="text-lg font-semibold mb-1">피부에 자연을 담다</h3>
            <p className="text-sm mb-2">스킨케어로 더욱 건강한 피부</p>
            <Link
              to="/shop?category=skincare"
              className="inline-flex items-center gap-1 bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              스킨케어 라인업 보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Best Sellers</h2>
        {isLoading && (
          <div className="text-center text-gray-500 flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            로딩 중...
          </div>
        )}
        {error && <div className="text-center text-red-600">{error}</div>}

        {products && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border rounded-lg shadow-lg overflow-hidden flex flex-col hover:scale-105 transform transition"
              >
                <img
                  src={`http://localhost:5001/uploads/productImages/${product.image_url}`}
                  alt={product.name || "상품명 없음"}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-base font-semibold mb-1 truncate">
                      {product.name || "상품명 없음"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.price
                        ? `₩${product.price.toLocaleString()}`
                        : "가격 정보 없음"}
                    </p>
                  </div>
                  <Link
                    to={`/shop/product/${product.id}`}
                    className="mt-2 text-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
