import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider, themeInitScript } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import { profile } from "@/lib/content";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["wdth", "opsz"],
  display: "swap",
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const title = "Phạm Hồng Quân, Frontend Developer";
const description =
  "Frontend developer building fast, responsive interfaces with React, Next.js and Tailwind CSS, with enough backend to wire them to real APIs.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title,
  description,
  keywords: ["Frontend Developer", "React", "Next.js", "TypeScript", "Tailwind CSS", "REST API", "Laravel"],
  authors: [{ name: "Phạm Hồng Quân" }],
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "profile", url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Phạm Hồng Quân",
  jobTitle: "Frontend Developer",
  url: profile.site,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
  knowsAbout: ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST APIs", "Laravel", "AI coding agents"],
  sameAs: [profile.github, profile.linkedin].filter(Boolean),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-sun px-4 py-2 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
