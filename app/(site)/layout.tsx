import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { headScript } from "@/lib/headScript";
import Header from "@/components/Header";
import Opening from "@/components/Opening";
import { getSite, themeCss } from "@/lib/site";
import { profile as fallback } from "@/lib/content";

// Unbounded for display type (bold, wide, characterful), Manrope for text.
const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { profile, content, settings } = await getSite();
  const { title, description, keywords } = settings.seo;
  return {
    metadataBase: new URL(URL.canParse(profile.site) ? profile.site : fallback.site),
    title,
    description,
    keywords,
    authors: [{ name: content.en.name }],
    alternates: { canonical: "/", types: { "text/markdown": "/llms.txt" } },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { title, description, type: "profile", url: "/", siteName: content.en.name, locale: "en_US", alternateLocale: ["vi_VN"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  const { profile, content, settings } = site;
  // Google's ProfilePage markup: the page is about one Person. The first job is the current one.
  const c = content.en;
  const person = `${profile.site}/#person`;
  const job = c.experience.jobs[0];
  const school = c.experience.education[0];
  const personLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${profile.site}/#website`, url: profile.site, name: c.name, inLanguage: ["en", "vi"], publisher: { "@id": person } },
      {
        "@type": "ProfilePage",
        "@id": `${profile.site}/#profile`,
        url: profile.site,
        name: settings.seo.title,
        description: settings.seo.description,
        isPartOf: { "@id": `${profile.site}/#website` },
        mainEntity: { "@id": person },
      },
      {
        "@type": "Person",
        "@id": person,
        name: c.name,
        alternateName: "Hong Quan Pham",
        jobTitle: c.hero.role,
        description: c.hero.intro,
        url: profile.site,
        image: `${profile.site}/logo.png`,
        email: `mailto:${profile.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
        ...(job && { worksFor: { "@type": "Organization", name: job.org } }),
        ...(school && { alumniOf: { "@type": "CollegeOrUniversity", name: school.org } }),
        knowsAbout: c.hero.stack,
        knowsLanguage: ["vi", "en"],
        sameAs: [profile.github, profile.linkedin].filter(Boolean),
      },
    ],
  };
  const theme = themeCss(settings.theme);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replaceAll("<", "\\u003c") }} />
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: theme }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <Opening />
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-sun px-4 py-2 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <LanguageProvider site={site}>
            <Header />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
