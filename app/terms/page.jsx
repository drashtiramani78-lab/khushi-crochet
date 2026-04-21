
import '../global.css';


export const metadata = {
  title: 'Terms & Conditions | Khushi Crochet',
  description: 'Terms and conditions for using Khushi Crochet services including orders, payments, shipping, and returns policy.'
};

export default function TermsPage() {
  return (
    <main className="static-page container">

        <h1>Terms & Conditions</h1>
        <section>
          <h2>1. General</h2>
          <p>These terms govern use of Khushi Crochet website and services.</p>
        </section>
        <section>
          <h2>2. Orders & Payments</h2>
          <p>Orders are confirmed upon payment. We accept UPI, Razorpay, Stripe. Custom orders take 7-14 days.</p>
        </section>
        <section>
          <h2>3. Shipping</h2>
          <p>Shipping across India. See Shipping page for details. Delays due to courier not liable.</p>
        </section>
        <section>
          <h2>4. Returns</h2>
          <p>7-day return for unused items. Custom orders non-returnable. Contact support@khushicrochet.com.</p>
        </section>
        <section>
          <h2>5. Governing Law</h2>
          <p>Laws of India apply. Disputes in Mumbai courts.</p>
        </section>
<p className="updated">Last updated: {new Date().toLocaleDateString()}</p>
      </main>
  );
}

