const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { dbPromise } = require("../config/db");
const router = express.Router();
// 유효성 검사 함수
const validateId = (id) => !isNaN(id) && id > 0;
const productImagesDir = path.join(__dirname, "../uploads/productImages");
// 폴더가 없으면 생성
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// multer 설정 (단일 파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productImagesDir); // 이미지 파일을 productImages 폴더에 저장
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // 고유 파일 이름
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 확장자 유지
  },
});

const upload = multer({ storage: storage });

// 이미지 업로드 API (단일 파일만 처리)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "이미지를 업로드 해주세요." });
  }

  res.json({
    success: true,
    imageUrl: req.file.filename, // 업로드된 파일의 이름을 클라이언트로 반환
  });
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    // 'all' 카테고리일 경우 모든 상품 조회 처리
    if (category === "all") {
      const [results] = await dbPromise.query("SELECT * FROM products");
      return res.json({ message: "전체 상품 목록 조회 성공", data: results });
    }

    // 다른 카테고리의 상품 조회
    const [results] = await dbPromise.query(
      "SELECT * FROM products WHERE category = ?",
      [category]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 카테고리의 상품이 없습니다." });
    }

    res.json({ message: "상품 목록 조회 성공", data: results });
  } catch (err) {
    console.error("카테고리별 상품 조회 오류:", err);
    return res
      .status(500)
      .json({ message: "카테고리 상품 조회에 실패했습니다." });
  }
});

// 전체 상품 조회
router.get("/", async (req, res) => {
  try {
    const [results] = await dbPromise.query("SELECT * FROM products");
    res.json({ message: "상품 목록 조회 성공", data: results });
  } catch (err) {
    console.error("상품 목록 조회 오류:", err);
    return res.status(500).json({ message: "상품 목록 조회에 실패했습니다." });
  }
});

// 상품 ID별 조회
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching product with ID: ${id}`);

  // 유효성 검사
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
  }

  try {
    const [productResult] = await dbPromise.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (productResult.length === 0) {
      return res.status(404).json({ message: "해당 상품을 찾을 수 없습니다." });
    }

    const [imageResult] = await dbPromise.query(
      "SELECT image_url FROM product_images WHERE product_id = ?",
      [id]
    );

    const product = productResult[0];
    product.images = imageResult.map((image) => image.image_url);

    console.log("상품 조회 성공:", product);
    res.json(product);
  } catch (err) {
    console.error("상품 조회 오류:", err);
    return res
      .status(500)
      .json({ message: "상품 정보를 가져오는 데 실패했습니다." });
  }
});

// 상품 등록 API
router.post("/products", async (req, res) => {
  const {
    name,
    price,
    category,
    effect,
    size,
    stock,
    description,
    detailed_info,
    art_of_perfuming,
    shipping_time,
    return_policy,
    images = [], // 이미지 배열
  } = req.body;

  console.log("상품 등록 요청:", req.body);
  // 필수 필드 유효성 검사
  if (!name || !price || !category || !description) {
    return res.status(400).json({ message: "필수 정보를 입력해주세요." });
  }
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: "유효한 가격을 입력해주세요." });
  }
  if (isNaN(stock) || stock < 0) {
    return res
      .status(400)
      .json({ message: "유효한 재고 수량을 입력해주세요." });
  }

  try {
    // 1️⃣ `products` 테이블에 새 상품 추가
    const [productResult] = await dbPromise.query(
      `INSERT INTO products 
       (name, price, category, effect, size, stock, description, detailed_info, art_of_perfuming, shipping_time, return_policy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        price,
        category,
        effect,
        size,
        stock,
        description,
        detailed_info,
        art_of_perfuming,
        shipping_time,
        return_policy,
      ]
    );

    const productId = productResult.insertId;

    // 2️⃣ 대표 이미지 처리: `products` 테이블의 `image_url` 컬럼에 저장
    if (images.length > 0) {
      const [updateProductResult] = await dbPromise.query(
        "UPDATE products SET image_url = ? WHERE id = ?",
        [images[0], productId]
      );
    }

    // 3️⃣ `product_images` 테이블에 추가 이미지 경로 저장
    if (Array.isArray(images) && images.length > 1) {
      const imageInsertPromises = images
        .slice(1)
        .map((imageUrl) =>
          dbPromise.query(
            "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
            [productId, imageUrl]
          )
        );
      await Promise.all(imageInsertPromises);
    }

    res.status(201).json({
      message: "상품이 성공적으로 추가되었습니다.",
      productId,
    });
  } catch (err) {
    console.error("상품 추가 오류:", err);
    return res.status(500).json({ message: "상품 추가에 실패했습니다." });
  }
});

// 상품 업데이트
router.put("/product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_urls = [] } = req.body;

  if (!validateId(id)) {
    return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
  }
  if (price && (isNaN(price) || price <= 0)) {
    return res.status(400).json({ message: "유효한 가격을 입력해주세요." });
  }

  try {
    const [updateResult] = await dbPromise.query(
      "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
      [name, description, price, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "해당 상품을 찾을 수 없습니다." });
    }

    // 2️⃣ `product_images` 테이블에 이미지 경로 저장
    if (Array.isArray(images) && images.length > 0) {
      const imageInsertPromises = images.map((imageUrl) => {
        console.log(`Inserting image URL: ${imageUrl}`); // 이미지 경로 확인
        return dbPromise.query(
          "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
          [productId, imageUrl]
        );
      });
      await Promise.all(imageInsertPromises);
    }

    res.json({ message: "상품이 성공적으로 업데이트되었습니다." });
  } catch (err) {
    console.error("상품 업데이트 오류:", err);
    return res.status(500).json({ message: "상품 업데이트에 실패했습니다." });
  }
});

// 상품 삭제
router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

  if (!validateId(id)) {
    return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
  }

  try {
    const [deleteResult] = await dbPromise.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "해당 상품을 찾을 수 없습니다." });
    }

    res.json({ message: "상품이 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("상품 삭제 오류:", err);
    return res.status(500).json({ message: "상품 삭제에 실패했습니다." });
  }
});

// 상품 QnA 등록
router.post("/product/:id/qna", async (req, res) => {
  const { id } = req.params;
  const { question, userName } = req.body;

  // 질문과 사용자 이름이 없으면 오류 처리
  if (!question || !userName) {
    return res
      .status(400)
      .json({ message: "질문과 사용자 이름은 필수입니다." });
  }

  try {
    // 제품명 조회
    const [product] = await dbPromise.query(
      "SELECT name FROM products WHERE id = ?",
      [id]
    );
    if (product.length === 0) {
      return res.status(404).json({ message: "제품을 찾을 수 없습니다." });
    }

    const productName = product[0].name;

    // QnA를 테이블에 저장 (createdAt, updatedAt은 현재 시간으로 설정)
    const [result] = await dbPromise.query(
      "INSERT INTO qna (question, userName, productId, productName, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [question, userName, id, productName]
    );

    res.status(201).json({
      message: "QnA 등록 성공",
      data: {
        id: result.insertId,
        question,
        userName,
        productId: id,
        productName,
      },
    });
  } catch (err) {
    console.error("QnA 등록 실패:", err);
    return res.status(500).json({ message: "QnA 등록에 실패했습니다." });
  }
});

// 전체 상품 조회
router.get("/", async (req, res) => {
  try {
    const [results] = await dbPromise.query("SELECT * FROM products");
    res.json({ message: "상품 목록 조회 성공", data: results });
  } catch (err) {
    console.error("상품 목록 조회 오류:", err);
    return res.status(500).json({ message: "상품 목록 조회에 실패했습니다." });
  }
});

module.exports = router;
