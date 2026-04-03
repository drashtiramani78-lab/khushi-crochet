"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        let normalizedProducts = [];

        if (Array.isArray(data)) {
          normalizedProducts = data;
        } else if (Array.isArray(data?.products)) {
          normalizedProducts = data.products;
        }

        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user || authLoading) return;

    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        const wishlistProductIds = new Set(
          (data?.data || []).map((item) => item.productId)
        );

        setWishlistItems(wishlistProductIds);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    }

    fetchWishlist();
  }, [user, authLoading]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((p) => p?.category).filter(Boolean)),
    ];
  }, [products]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p?.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p?.name?.toLowerCase().includes(query) ||
          p?.description?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const getPrice = (item) => {
        if (typeof item?.price === "string") {
          return parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        }
        return Number(item?.price) || 0;
      };

      switch (sortBy) {
        case "price-low":
          return getPrice(a) - getPrice(b);
        case "price-high":
          return getPrice(b) - getPrice(a);
        case "name":
        default:
          return (a?.name || "").localeCompare(b?.name || "");
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, searchQuery]);

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  const getSafeImageSrc = (product) => {
    const src = product?.image;

    if (!src || typeof src !== "string") return null;

    const trimmed = src.trim();

    if (!trimmed) return null;
    if (trimmed.startsWith("blob:")) return null;
    if (trimmed === "undefined" || trimmed === "null") return null;

    return trimmed;
  };

  const getProductHref = (product) => {
    if (product?.slug) return `/products/${product.slug}`;
    if (product?._id) return `/products/${product._id}`;
    return "/products";
  };

  const handleQuickAddToCart = (product) => {
    if ((product?.inventory || 0) <= 0) return;

    addToCart(product, 1);
    setAddedToCart((prev) => ({ ...prev, [product._id]: true }));

    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  const handleBuyNow = (product) => {
    if ((product?.inventory || 0) <= 0) return;

    addToCart(product, 1);
    router.push("/cart");
  };

  const handleToggleWishlist = async (product) => {
    if (!user || authLoading) {
      router.push("/login?redirect=/products");
      return;
    }

    try {
      const isInWishlist = wishlistItems.has(product._id);

      if (isInWishlist) {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product._id }),
        });

        if (res.ok) {
          const newWishlist = new Set(wishlistItems);
          newWishlist.delete(product._id);
          setWishlistItems(newWishlist);
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product._id }),
        });

        if (res.ok) {
          setWishlistItems(new Set([...wishlistItems, product._id]));
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  if (isLoading) {
    return (
      <section className="products-page luxury-products-page">
        <div className="container">
          <div className="products-loading">
            <div className="products-loading-spinner"></div>
            <p>Loading our luxury collection...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="products-page luxury-products-page">
      <div className="container">
        <div className="products-hero">
          <div className="products-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Shop</span>
          </div>

          <div className="products-hero-inner">
            <span className="section-label">Curated Collection</span>
            <h1 className="products-page-title">Our Crochet Collection</h1>
            <p className="products-page-subtitle">
              Thoughtfully handcrafted crochet pieces with a refined,
              soft-luxury aesthetic for gifting, styling, and meaningful moments.
            </p>
          </div>
        </div>

        <div className="products-toolbar">
          <div className="products-search">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="products-filters">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="products-results-info">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <p>
              {products.length === 0
                ? "No products available at the moment."
                : "No products match your search or filters."}
            </p>

            {products.length > 0 && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setSortBy("name");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid luxury-products-grid">
            {filteredProducts.map((product) => {
              const productPrice =
                typeof product?.price === "string"
                  ? product.price
                  : Number(product?.price || 0).toFixed(0);

              const isWishlisted = wishlistItems.has(product?._id);
              const safeImageSrc = getSafeImageSrc(product);
              const productHref = getProductHref(product);

              return (
                <article
                  className="product-card luxury-product-card"
                  key={product?._id || product?.slug || product?.name}
                >
                  <div className="product-image-wrap luxury-image-wrap">
                    {safeImageSrc && !imageErrors[product?._id] ? (
                      <Image
                        src={safeImageSrc}
                        alt={product?.name || "Product image"}
                        width={500}
                        height={500}
                        className="product-image"
                        unoptimized
                        onError={() => handleImageError(product?._id)}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>Image unavailable</span>
                      </div>
                    )}

                    <span className="product-badge">Handmade</span>

                    <button
                      type="button"
                      className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                      onClick={() => handleToggleWishlist(product)}
                      title={
                        isWishlisted
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="product-content luxury-product-content">
                    <h3 className="product-name">{product?.name}</h3>

                    <p className="product-short-desc">
                      {product?.description
                        ? product.description.slice(0, 90) +
                          (product.description.length > 90 ? "..." : "")
                        : "Beautifully handcrafted crochet piece made with care."}
                    </p>

                    <div className="product-meta">
                      <span className="product-price">₹{productPrice}</span>
                      <span
                        className={`stock-pill ${
                          (product?.inventory || 0) > 0
                            ? "in-stock"
                            : "out-of-stock"
                        }`}
                      >
                        {(product?.inventory || 0) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    <div className="product-card-actions">
                      <Link href={productHref} className="product-btn">
                        View Product
                      </Link>

                      <button
                        type="button"
                        className={`product-outline-btn ${
                          addedToCart[product?._id] ? "added" : ""
                        }`}
                        onClick={() => handleQuickAddToCart(product)}
                        disabled={(product?.inventory || 0) <= 0}
                      >
                        {addedToCart[product?._id] ? "Added" : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        className="product-dark-btn"
                        onClick={() => handleBuyNow(product)}
                        disabled={(product?.inventory || 0) <= 0}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {products.length > 0 && (
          <div className="products-bottom-cta">
            <p>Looking for something more personal?</p>
            <Link href="/#custom-order-hero" className="product-dark-btn cta-btn">
              Request a Custom Order
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}