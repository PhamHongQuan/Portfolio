import Hero from "@/components/Hero";
import About from "@/components/About";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { FireflyCursor, MeteorShower, Spotlight } from "@/components/Effects";
import Film from "@/components/Film";
import PrintCV from "@/components/PrintCV";
import Weather from "@/components/Weather";
import Seasons from "@/components/Seasons";
import PerfHud from "@/components/PerfHud";
import { getSite } from "@/lib/site";

// Hero always opens the film; the rest follow the admin's order (settings.sections).
const scenes = { about: About, stack: Stack, projects: Projects, experience: Experience, contact: Contact };

export default async function Home() {
  const { settings } = await getSite();
  return (
    <>
      <main id="main">
        <Film>
          <Hero />
          {settings.sections
            .filter((s) => s.visible)
            .map(({ id }) => {
              const Section = scenes[id];
              return <Section key={id} />;
            })}
        </Film>
      </main>
      <Footer />
      <Spotlight />
      <FireflyCursor />
      <MeteorShower />
      <Weather />
      <Seasons />
      <PerfHud />
      <PrintCV />
    </>
  );
}
