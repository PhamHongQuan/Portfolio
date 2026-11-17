import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { headScript } from "@/lib/headScript";
import Header from "@/components/Header";
import Opening from "@/components/Opening";
import { profile } from "@/lib/content";

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
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
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
          <LanguageProvider>
            <Header />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
