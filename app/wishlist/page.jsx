'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import styles from '@/app/styles/wishlist.module.css';

export default function WishlistPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/wishlist');
        return;
      }
      fetchWishlist();
    }
  }, [authLoading, user, router]);

  const { addToCart: addToCartContext } = useCart();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wishlist', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setItems(items.filter(item => item.productId !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (product) => {
    const cartItem = {
      _id: product.productId,
      name: product.productName,
      price: product.productPrice,
      image: product.productImage,
      quantity: 1,
    };
    addToCartContext(cartItem);
    alert('Added to cart!');
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your wishlist...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>❤️ My Wishlist</h1>
        <p>Your favorite items</p>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Your wishlist is empty</p>
          <Link href="/products" className={styles.shopBtn}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div>
          <div className={styles.count}>
            {items.length} {items.length === 1 ? 'item' : 'items'} in wishlist
          </div>

          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item._id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    src={item.productImage || '/placeholder.png'}
                    alt={item.productName}
                    className={styles.image}
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(item.productId)}
                    title="Remove from wishlist"
                  >
                    ❌
                  </button>
                </div>

                <div className={styles.content}>
                  <h3>{item.productName}</h3>
                  <p className={styles.price}>
                    ₹{item.productPrice?.toLocaleString('en-IN')}
                  </p>

                  <div className={styles.actions}>
                    <button
                      className={styles.cartBtn}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${item.productId}`}
                      className={styles.viewBtn}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
