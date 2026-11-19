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
    alternates: { canonical: "/" },
    openGraph: { title, description, type: "profile", url: "/" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  const { profile, content, settings } = site;
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.en.name,
    jobTitle: content.en.hero.role,
    url: profile.site,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
    knowsAbout: content.en.hero.stack,
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
  };
  const theme = themeCss(settings.theme);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replaceAll("<", "\\u003c") }} />
        {theme && <style dangerouslySetInnerHTML={{ __html: theme }} />}
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
