import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { GsapProvider } from "@/components/GsapProvider";
import { t } from "@/lib/t";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-poppins",
  display: "swap",
  adjustFontFallback: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  adjustFontFallback: true,
});

const site = t("site");

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharkshield.vercel.app"),
  openGraph: {
    title: site.name,
    description: site.tagline,
    images: ["/scenes/hero.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <body>
        <a href="#main" className="skip-link">{t("nav").skip}</a>
        <NavBar />
        <GsapProvider>
          <main id="main">{children}</main>
          <Footer />
        </GsapProvider>
      </body>
    </html>
  );
}
