"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    }

    fetchProducts();
  }, []);

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      slug: product.slug || "",
      quantity: 1,
    });
  };

  const handleBuyNow = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      slug: product.slug || "",
      quantity: 1,
    });

    router.push("/cart");
  };

  return (
    <section className="featured-products" id="products">
      <div className="container">
        <div className="section-header text-center">
          <p className="section-label">Featured Collection</p>
          <h2 className="section-title">Our Best Selling Crochet Pieces</h2>
          <p className="section-description">
            Soft, elegant and handmade creations designed to add charm to every
            special occasion.
          </p>
        </div>

        <div className="row g-4">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <div className="col-lg-3 col-md-6" key={product._id}>
                <div className="product-card">
                  <div className="product-image-wrap">
                    {!imageErrors[product._id] &&
                    product.image &&
                    !product.image.startsWith("blob:") ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        width={400}
                        height={300}
                        priority={products.findIndex(p => p._id === product._id) < 4}
                        onError={() => handleImageError(product._id)}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />

                    ) : (
                      <div
                        className="product-image"
                        style={{
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "200px",
                        }}
                      >
                        <span style={{ color: "#999" }}>Image unavailable</span>
                      </div>
                    )}

                    <span className="product-badge">Handmade</span>
                  </div>

                  <div className="product-content">
                    <h3>{product.name}</h3>
                    <p className="product-price">₹{product.price}</p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginTop: "15px",
                      }}
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        className="product-btn"
                      >
                        View Product
                      </Link>

                      <button
                        type="button"
                        className="product-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        className="product-btn"
                        onClick={() => handleBuyNow(product)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}