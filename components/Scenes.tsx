"use client";

import About from "./About";
import Stack from "./Stack";
import Projects from "./Projects";
import Experience from "./Experience";
import Contact from "./Contact";
import { useLanguage } from "@/contexts/LanguageContext";

// Hero always opens the film; the rest follow the admin's order (settings.sections). Read from
// context rather than the server so the admin preview can reorder them live.
const scenes = { about: About, stack: Stack, projects: Projects, experience: Experience, contact: Contact };

export default function Scenes() {
  const { sections } = useLanguage();
  return sections
    .filter((s) => s.visible)
    .map(({ id }) => {
      const Section = scenes[id];
      return <Section key={id} />;
    });
}
