import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { FireflyCursor, MeteorShower, Spotlight } from "@/components/Effects";
import Film from "@/components/Film";
import PrintCV from "@/components/PrintCV";
import Weather from "@/components/Weather";
import Seasons from "@/components/Seasons";
import PerfHud from "@/components/PerfHud";
import Scenes from "@/components/Scenes";

export default function Home() {
  return (
    <>
      <main id="main">
        <Film>
          <Hero />
          <Scenes />
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
