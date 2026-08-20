import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Concept from "@/components/Concept";
import Sectors from "@/components/Sectors";
import Architecture from "@/components/Architecture";
import Manifesto from "@/components/Manifesto";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Concept />
      <Sectors />
      <Architecture />
      <Manifesto />
      <CTA />
      <Footer />
    </main>
  );
}
