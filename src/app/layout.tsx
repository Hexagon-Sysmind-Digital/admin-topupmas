import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono, Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Load Google Fonts
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Load Custom Peace Sans local font
const peaceSans = localFont({
  src: "../../public/assets/font/Toy-Story-Font/Peace Sans Webfont.ttf",
  variable: "--font-peace-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADMIN TOPUPMAS - Admin Portal",
  description: "Portal Admin resmi untuk manajemen layanan TOPUPMAS. Kelola produk, transaksi, dan voucher game dengan performa retro maksimal.",
  icons: {
    icon: "/assets/svelte.svg", // Using the copied svg icon as favicon
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${bricolage.variable} ${spaceMono.variable} ${workSans.variable} ${peaceSans.variable}`}
    >
      <head>
        {/* Material Symbols Outlined for icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
