"use client";

import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../app/styles/cart.css";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <h2 className="cart-empty-title">Your Cart is Empty</h2>
          <p className="cart-empty-text">
            Start shopping to add items to your cart
          </p>
          <Link href="/products" className="cart-continue-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header-area">
          <div className="cart-breadcrumb">
            <Link href="/">Home</Link>
            <span className="cart-breadcrumb-separator">/</span>
            <span className="cart-breadcrumb-current">Shopping Cart</span>
          </div>

          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">Review your items before checkout</p>
        </div>

        <div className="cart-wrapper">
          <div className="cart-items">
            <div className="cart-table-head">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {cart.map((item) => {
              const itemPrice =
                typeof item.price === "string"
                  ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                  : item.price;

              const displayPrice =
                typeof item.price === "string"
                  ? item.price
                  : item.price.toFixed(2);

              return (
                <div key={item._id} className="cart-item">
                  <div className="cart-product">
                    <div className="cart-product-image">
                      {item.image && !item.image.startsWith("blob:") ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={140}
                          height={140}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="cart-image-placeholder">
                          Image unavailable
                        </div>
                      )}
                    </div>

                    <div className="cart-product-info">
                      <h3 className="cart-product-name">{item.name}</h3>
                    </div>
                  </div>

                  <div className="cart-price">₹{displayPrice}</div>

                  <div className="cart-qty">
                    <div className="cart-qty-box">
                      <button
                        className="cart-qty-btn"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item._id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="cart-qty-input"
                      />

                      <button
                        className="cart-qty-btn"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-total">
                    ₹{(itemPrice * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className="cart-remove"
                    onClick={() => removeFromCart(item._id)}
                    title="Remove from cart"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>
                <strong>₹{total.toFixed(2)}</strong>
              </span>
            </div>

            <div className="cart-summary-row">
              <span>Shipping:</span>
              <span style={{ fontWeight: "600", color: "#27ae60" }}>FREE</span>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <strong>Total:</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </button>

            <button
              className="cart-outline-btn"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </button>

            <button
              className="cart-clear-btn"
              onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  clearCart();
                }
              }}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}