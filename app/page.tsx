import Hero from "./components/hero";
import AboutSection from "./components/aboutsection";
import CustomOrders from "./customorder/page";
import Contact from "./contact/page";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <CustomOrders />
      <Contact />
    </>
  );
}