import '../global.css';
import '../styles/checkout.css'; // Reuse delivery styles

export const metadata = {
  title: 'Shipping & Delivery | Khushi Crochet',
  description: 'Shipping rates, delivery times, free shipping threshold, and tracking information for Khushi Crochet orders.'
};

export default function ShippingPage() {
  return (
    <main className="static-page container">
      <h1>Shipping & Delivery</h1>
      <section>
        <h2>India-wide Shipping</h2>
        <ul>
          <li><strong>Metro Cities:</strong> 2-4 days (₹60-100)</li>
          <li><strong>Tier 2:</strong> 4-7 days (₹80-120)</li>
          <li><strong>Remote:</strong> 7-10 days (₹100-150)</li>
        </ul>
      </section>
      <section>
        <h2>Free Shipping</h2>
        <p>Orders above ₹999</p>
      </section>
      <section>
        <h2>Custom Orders</h2>
        <p>7-14 business days + standard shipping.</p>ca
      </section>
      <section>
        <h2>Track Order</h2>
        <p>Use /order-track or email tracking ID.</p>
      </section>
      <div className="shipping-note">
        <p><strong>Note:</strong> Delays during festivals. Insured shipping.</p>
      </div>
    </main>
  );
}
