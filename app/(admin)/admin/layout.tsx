import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Own root layout: none of the site's film, header or Supabase read.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-theme="light">
      <body className="bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
