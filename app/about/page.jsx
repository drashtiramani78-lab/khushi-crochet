import AboutSection from '../components/aboutsection.jsx';
import '../global.css';
import '../styles/about.css';

export const metadata = {
  title: 'About Us | Khushi Crochet',
  description: 'Learn about Khushi Crochet, our handmade crochet creations, custom orders, and commitment to quality.'
};

export default function AboutPage() {
  return (
    <main className="about-main">
      <AboutSection />
      <section className="about-story container">
        <h2>Our Crochet Journey</h2>
        <p>Khushi Crochet – handcrafted with love! Every stitch tells a story of tradition and creativity from India.</p>
        <div className="about-features">
          <div>Handmade</div>
          <div>Custom Orders</div>
          <div>Fast Shipping</div>
        </div>
      </section>
    </main>
  );
}
