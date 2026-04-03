"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const res = await fetch(`/api/products/${id}`);

        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product || product.inventory <= 0) return;
    addToCart(product, quantity);
    router.push("/cart");
  };

  const handleAddToCart = () => {
    if (!product || product.inventory <= 0) return;

    addToCart(product, quantity);
    setSuccessMessage(`${quantity} item(s) added to cart`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const displayPrice =
    typeof product?.price === "string"
      ? product.price
      : Number(product?.price || 0).toFixed(2);

  if (isLoading) {
    return (
      <section className="product-details-page">
        <div className="container">
          <div className="products-loading">
            <div className="products-loading-spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-details-page">
        <div className="container">
          <div className="product-error-box">
            <h2>Product Not Found</h2>
            <p>The product you are looking for does not exist.</p>
            <Link href="/products" className="buy-btn">
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-details-page">
      <div className="container">
        <div className="products-breadcrumb details-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-details-grid">
          <div className="product-details-image-wrap">
            {!imageError && product.image && !product.image.startsWith("blob:") ? (
              <Image
                src={product.image}
                alt={product.name}
                width={700}
                height={800}
                className="product-details-main-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="product-details-image-placeholder">
                <span>Image unavailable</span>
              </div>
            )}
          </div>

          <div className="product-details-content">
            <span className="product-category">
              {product.category || "Handmade Crochet"}
            </span>

            <h1>{product.name}</h1>

            <div className="product-details-price-wrap">
              <span className="product-details-price">₹{displayPrice}</span>

              {product.inventory > 0 ? (
                <span className="stock-pill in-stock">
                  In Stock ({product.inventory} available)
                </span>
              ) : (
                <span className="stock-pill out-of-stock">Out of Stock</span>
              )}
            </div>

            {successMessage && (
              <div className="product-success-message">{successMessage}</div>
            )}

            <div className="product-details-description-block">
              <h3>Description</h3>
              <p className="product-details-description">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="product-info-box">
              <h4>Product Details</h4>
              <p>
                <strong>Category:</strong> {product.category || "Crochet"}
              </p>
              <p>
                <strong>Craftsmanship:</strong> Handmade with care and attention
                to detail
              </p>
              <p>
                <strong>Style:</strong> Elegant, soft, and thoughtfully crafted
              </p>
            </div>

            <div className="quantity-section">
              <label className="quantity-label">Quantity</label>

              <div className="quantity-controls">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <span className="quantity-value">{quantity}</span>

                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(product.inventory || 1, prev + 1)
                    )
                  }
                  disabled={quantity >= (product.inventory || 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-details-actions">
              <button
                type="button"
                className="buy-btn"
                onClick={handleBuyNow}
                disabled={product.inventory <= 0}
              >
                Buy Now
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={handleAddToCart}
                disabled={product.inventory <= 0}
              >
                Add to Cart
              </button>
            </div>

            <div className="product-luxury-features">
              <div className="luxury-feature-item">
                <span>✦</span>
                <p>Handcrafted with love and premium finishing</p>
              </div>
              <div className="luxury-feature-item">
                <span>✦</span>
                <p>Soft luxury gifting and personal styling piece</p>
              </div>
              <div className="luxury-feature-item">
                <span>✦</span>
                <p>Carefully packed for a beautiful unboxing experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}