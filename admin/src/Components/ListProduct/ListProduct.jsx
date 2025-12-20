import React, { useState, useEffect } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png";

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/allproducts");
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Response from backend:", data);
      setAllProducts(data.products || []); // ✅ pick products array
    } catch (err) {
      console.error("fetchInfo error:", err);
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    try {
      const res = await fetch("http://localhost:4000/removeproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setAllProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        console.error("❌ Failed to remove product:", data);
      }
    } catch (err) {
      console.error("Error removing product:", err);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="list-product">
      <h1>All Products List</h1>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>

      <div className="listproduct-allproducts">
        <hr />
        {Array.isArray(allProducts) &&
          allProducts.map((product, index) => (
            <div
              className="listproduct-format-main listproduct-format">
              <img
                src={product.image}
                alt={product.name || `product-${index}`}
                className="listproduct-product-image"
              />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img
                src={cross_icon}
                alt="remove"
                className="listproduct-remove-icon"
                onClick={() => removeProduct(product.id)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ListProduct;
