import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="about-image-wrap">
              <Image
                src="/about.png"
                alt="About Khushi Crochet"
                className="about-image"
                width={700}
                height={550}
                priority
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="about-content">
              <p className="section-label">About Khushi Crochet</p>
              <h2 className="section-title">Crafted with patience, warmth and elegance</h2>
              <p className="about-text">
                Khushi Crochet is a handmade crochet studio dedicated to creating
                thoughtful pieces that feel personal, refined, and timeless.
                Every design is carefully made to bring softness and beauty into
                everyday gifting.
              </p>
              <p className="about-text">
                From floral bouquets to keepsakes and custom gifts, each piece is
                designed with attention to detail and a love for handcrafted art.
              </p>

              <a href="/products" className="about-btn">
                Explore Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}