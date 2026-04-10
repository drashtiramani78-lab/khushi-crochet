import '../global.css';

export const metadata = {
  title: 'Privacy Policy | Khushi Crochet',
  description: 'Khushi Crochet privacy policy on data collection, usage, cookies, and user rights.'
};

export default function PrivacyPage() {
  return (
    <main className="static-page container">
      <h1>Privacy Policy</h1>
      <section>
        <h2>1. Information We Collect</h2>
        <p>User data: name, email, address, payment info (via Razorpay/Stripe, not stored). Crochet preferences.</p>
      </section>
      <section>
        <h2>2. How We Use Data</h2>
        <p>Process orders, send updates, improve recommendations. No selling data.</p>
      </section>
      <section>
        <h2>3. Cookies</h2>
        <p>Session/auth cookies. Opt-out via browser settings.</p>
      </section>
      <section>
        <h2>4. Security</h2>
        <p>Data encrypted. MongoDB secure. Contact for concerns.</p>
      </section>
      <section>
        <h2>5. Your Rights</h2>
        <p>Access/delete data via profile. GDPR compliant.</p>
      </section>
      <p className="updated">Last updated: $(new Date().toLocaleDateString())</p>
    </main>
  );
}
