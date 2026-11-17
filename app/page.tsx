import Hero from "@/components/Hero";
import About from "@/components/About";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/Effects";
import Film from "@/components/Film";

export default function Home() {
  return (
    <>
      <main id="main">
        <Film>
          <Hero />
          <About />
          <Stack />
          <Projects />
          <Experience />
          <Contact />
        </Film>
      </main>
      <Footer />
      <Spotlight />
    </>
  );
}
