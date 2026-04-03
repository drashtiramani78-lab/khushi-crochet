import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="hero-row">
          <div className="hero-content">
            <p className="hero-label">Handcrafted with love</p>

            <h1 className="hero-title">
              Elegant Crochet
              <br />
              Made Beautifully
            </h1>

            <p className="hero-description">
              Discover soft, handmade crochet creations designed with warmth,
              charm, and a luxury touch for every special moment.
            </p>

            <div className="hero-actions">
              <Link href="/products" className="hero-btn primary">
                Shop Collection
              </Link>

              <a href="#custom-order-hero" className="hero-btn secondary">
                Custom Orders
              </a>
            </div>

            <div className="hero-note">
              <span className="note-dot"></span>
              Premium handmade gifts, flowers, accessories and more
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <Image
                src="/hero.png"
                alt="Khushi Crochet handmade product"
                className="hero-image"
                width={620}
                height={760}
                priority
              />
            </div>

            <div className="floating-tag tag-one">Soft &amp; Cozy</div>
            <div className="floating-tag tag-two">Made with Love</div>
          </div>
        </div>
      </div>
    </section>
  );
}