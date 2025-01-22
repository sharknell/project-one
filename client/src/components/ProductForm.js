import React, { useState } from "react";
import axios from "axios";

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
    category: "",
    effect: "",
    size: "",
    stock: "",
    description: "",
    detailedInfo: "",
    artOfPerfuming: "",
    shippingTime: "",
    returnPolicy: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/admin/add-product", formData);
      alert("Product added successfully!");
      setFormData({
        name: "",
        price: "",
        imageUrl: "",
        category: "",
        effect: "",
        size: "",
        stock: "",
        description: "",
        detailedInfo: "",
        artOfPerfuming: "",
        shippingTime: "",
        returnPolicy: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
      />
      <input
        type="text"
        name="imageUrl"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={handleChange}
      />
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      {/* 나머지 필드도 추가 */}
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;
