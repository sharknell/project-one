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

// ✅ storage 설정 (대표 이미지 & 서브 이미지 저장용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productImagesDir);
  },
  filename: (req, file, cb) => {
    // 파일 이름에 Date.now()를 추가하여 중복 방지
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 카테고리별 상품 조회
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    if (category === "all") {
      const [results] = await dbPromise.query("SELECT * FROM products");
      return res.json({ message: "전체 상품 목록 조회 성공", data: results });
    }

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

// ✅ [이미지 업로드] - 대표 이미지 업로드 (단일 파일)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "이미지를 업로드 해주세요." });
  }

  res.json({ success: true, imageUrl: req.file.filename });
});

// ✅ [서브 이미지 업로드] - 여러 개 업로드 처리
router.post("/upload/multiple", upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "서브 이미지를 업로드 해주세요." });
  }

  const imageUrls = req.files.map((file) => file.filename);

  res.json({ success: true, imageUrls });
});

// 상품 등록
router.post("/products", async (req, res) => {
  const {
    name,
    price,
    category,
    size,
    description,
    detailed_info,
    shipping_time,
    return_policy,
    image_url,
    additionalImages,
  } = req.body;

  if (!name || !price || !category || !description) {
    console.error(
      "[필수 항목 누락] name, price, category, description 확인 필요"
    );
    return res.status(400).json({ message: "필수 정보를 입력해주세요." });
  }

  try {
    const [productResult] = await dbPromise.query(
      `INSERT INTO products (name, price, category, size, description, detailed_info, shipping_time, return_policy, image_url) 
       VALUES (?, ?, ?,  ?, ?,  ?, ?, ?, ?)`,
      [
        name,
        price,
        category,
        size,
        description,
        detailed_info,
        shipping_time,
        return_policy,
        image_url,
      ]
    );

    const productId = productResult.insertId;

    // 서브 이미지 저장
    if (Array.isArray(additionalImages) && additionalImages.length > 0) {
      console.log("[서브 이미지 저장] 이미지 URL 목록:", additionalImages);
      const imageQueries = additionalImages.map((img) =>
        dbPromise.query(
          "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
          [productId, img]
        )
      );
      await Promise.all(imageQueries);
    }

    console.log("[상품 등록 성공] 등록된 상품 ID:", productId);
    res.status(201).json({ message: "상품이 등록되었습니다.", productId });
  } catch (err) {
    console.error("[상품 등록 오류]:", err);
    res.status(500).json({ message: "상품 등록에 실패했습니다." });
  }
});

// 전체 상품 조회 (대표 이미지 + 서브 이미지 포함)
router.get("/", async (req, res) => {
  try {
    const [products] = await dbPromise.query("SELECT * FROM products");

    if (products.length === 0) {
      return res.json({ message: "상품이 없습니다.", data: [] });
    }

    const productIds = products.map((product) => product.id);

    const [imageResults] = await dbPromise.query(
      "SELECT product_id, image_url FROM product_images WHERE product_id IN (?)",
      [productIds]
    );

    const imageMap = {};
    imageResults.forEach(({ product_id, image_url }) => {
      if (!imageMap[product_id]) {
        imageMap[product_id] = [];
      }
      imageMap[product_id].push(image_url);
    });

    const productList = products.map((product) => ({
      ...product,
      subImages: imageMap[product.id] || [],
    }));

    console.log("상품 목록 조회 성공:", productList);
    res.json({ message: "상품 목록 조회 성공", data: productList });
  } catch (err) {
    console.error("상품 목록 조회 오류:", err);
    return res.status(500).json({ message: "상품 목록 조회에 실패했습니다." });
  }
});

// 상품 ID별 조회
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;

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

router.put(
  "/product/:id",
  upload.fields([{ name: "addimages", maxCount: 5 }]),
  async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    if (!validateId(productId)) {
      return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
    }

    const { name, price, category, description } = req.body;

    const removedImages = Array.isArray(req.body.removedImages)
      ? req.body.removedImages
      : req.body.removedImages
      ? [req.body.removedImages]
      : [];

    const addImages = req.files?.addimages?.map((file) => file.filename) || [];

    try {
      // 1. 상품 기본 정보 업데이트
      await dbPromise.query(
        `UPDATE products SET name = ?, price = ?, category = ?, description = ? WHERE id = ?`,
        [name, price, category, description, productId]
      );

      // 2. 제거할 이미지 삭제 (DB + 파일)
      for (const filename of removedImages) {
        await dbPromise.query(
          `DELETE FROM product_images WHERE product_id = ? AND image_url = ?`,
          [productId, filename]
        );

        const filePath = path.join(productImagesDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      // 3. 새 이미지 추가 (DB insert)
      for (const filename of addImages) {
        await dbPromise.query(
          `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
          [productId, filename]
        );
      }

      return res.json({ message: "상품이 성공적으로 업데이트되었습니다." });
    } catch (err) {
      console.error("상품 수정 오류:", err);
      return res.status(500).json({ message: "상품 수정에 실패했습니다." });
    }
  }
);

// 상품 삭제
router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

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

    await dbPromise.query("DELETE FROM product_images WHERE product_id = ?", [
      id,
    ]);

    await dbPromise.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "상품이 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("상품 삭제 오류:", err);
    return res.status(500).json({ message: "상품 삭제에 실패했습니다." });
  }
});

module.exports = router;
