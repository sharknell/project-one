const express = require("express");
const { dbPromise } = require("../config/db"); // dbPromise 사용
const router = express.Router();

// 유효성 검사 함수
const validateId = (id) => !isNaN(id) && id > 0;

// 카테고리별 상품 조회
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
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

// 상품 추가
router.post("/", async (req, res) => {
  const { name, description, price, image_urls = [] } = req.body;

  if (!name || !price || isNaN(price) || price <= 0) {
    return res
      .status(400)
      .json({ message: "상품명과 유효한 가격은 필수입니다." });
  }

  try {
    const [result] = await dbPromise.query(
      "INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
      [name, description, price]
    );

    const productId = result.insertId;

    // 이미지 URL 저장
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      const imageInsertPromises = image_urls.map((url) =>
        dbPromise.query(
          "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
          [productId, url]
        )
      );
      await Promise.all(imageInsertPromises);
    }

    res.status(201).json({
      message: "상품이 성공적으로 추가되었습니다.",
      data: { id: productId, name, description, price, image_urls },
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

    // 기존 이미지 삭제 및 새 이미지 추가
    if (Array.isArray(image_urls)) {
      await dbPromise.query("DELETE FROM product_images WHERE product_id = ?", [
        id,
      ]);
      const imageInsertPromises = image_urls.map((url) =>
        dbPromise.query(
          "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
          [id, url]
        )
      );
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
