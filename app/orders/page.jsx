'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import styles from '@/app/styles/orders.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/orders');
        return;
      }
      fetchOrders();
    }
  }, [authLoading, user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch regular orders for this user
      const ordersRes = await fetch('/api/orders/user', {
        credentials: "include",
      });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data || []);
      }

      // Fetch custom orders for this user
      const customRes = await fetch('/api/custom-orders/user', {
        credentials: "include",
      });
      if (customRes.ok) {
        const data = await customRes.json();
        setCustomOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: 'status-pending',
      Processing: 'status-processing',
      Shipped: 'status-shipped',
      Delivered: 'status-delivered',
      Cancelled: 'status-cancelled',
      'In Progress': 'status-processing',
      Completed: 'status-delivered',
    };
    return statusMap[status] || 'status-pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#ff9800',
      Processing: '#2196f3',
      Shipped: '#9c27b0',
      Delivered: '#4caf50',
      Cancelled: '#f44336',
      'In Progress': '#2196f3',
      Completed: '#4caf50',
    };
    return colors[status] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your orders...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Regular Orders ({orders.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Orders ({customOrders.length})
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className={styles.ordersSection}>
          {orders.length === 0 ? (
            <div className={styles.empty}>
              <p>No orders yet</p>
              <Link href="/products" className={styles.shopBtn}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h3>Order #{order._id?.slice(-8).toUpperCase()}</h3>
                      <p className={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`${styles.status} ${getStatusBadge(order.orderStatus)}`}
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </div>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.items}>
                      <h4>Items ({order.items?.length || 0})</h4>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className={styles.item}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>
                            Qty: {item.quantity}
                          </span>
                          <span className={styles.itemPrice}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.details}>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Total Amount:</span>
                        <span className={styles.value}>
                          ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                      {order.trackingId && (
                        <div className={styles.detailRow}>
                          <span className={styles.label}>Tracking ID:</span>
                          <span className={styles.value}>{order.trackingId}</span>
                        </div>
                      )}
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Delivery To:</span>
                        <span className={styles.value}>
                          {order.address},
                          {order.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <button
                      className={styles.trackBtn}
                      onClick={() => setSelectedOrder(order)}
                    >
                      Track Order
                    </button>
                    <button className={styles.invoiceBtn}>
                      Download Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className={styles.ordersSection}>
          {customOrders.length === 0 ? (
            <div className={styles.empty}>
              <p>No custom orders yet</p>
              <Link href="/customorder" className={styles.shopBtn}>
                Create Custom Order
              </Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {customOrders.map((order) => (
                <div key={order._id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h3>{order.title || 'Custom Order'}</h3>
                      <p className={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  <div
                      className={`${styles.status} ${getStatusBadge(order.orderStatus)}`}
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.status}
                    </div>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.customDetails}>
                      <p>
                        <strong>Description:</strong> {order.description}
                      </p>
                      <p>
                        <strong>Budget:</strong> ₹{order.budget}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {formatDate(order.deadline)}
                      </p>
                      {order.referenceImage && (
                        <p>
                          <strong>Reference Image:</strong> Uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <button className={styles.trackBtn}>View Details</button>
                    <button className={styles.invoiceBtn}>Send Message</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Order Tracking</h2>
            <div className={styles.timeline}>
              {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
                <div
                  key={step}
                  className={`${styles.timelineStep} ${
                    ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(
                      selectedOrder.status
                    ) >= idx
                      ? styles.completed
                      : ''
                  }`}
                >
                  <div className={styles.timelineMarker}></div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
