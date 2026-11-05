import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emergency Response — SOS, First Aid & Incident Reporting",
  description:
    "One-tap SOS with live location, offline first-aid guidance, community incident reporting, and responder coordination. Not a replacement for emergency services — always call 112/911 in a life-threatening emergency.",
};

export const viewport: Viewport = {
  themeColor: "#7f1d1d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-black"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">{children}</main>
        <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">
          In a life-threatening emergency, always call your local emergency number (112/911) first.
          This app supplements — never replaces — emergency services.
        </footer>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
