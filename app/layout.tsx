import "./globals.css";
import { Montserrat } from "next/font/google";
import "material-symbols";
import { Analytics } from "@vercel/analytics/react";
import { SessionContextProvider } from "@/hooks/auth";
import { NavbarContextProvider } from "@/hooks/navbar";
import { PostContextProvider } from "@/hooks/post";
import { Providers } from "./providers";
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Nemmy",
  description: "A Lemmy Client for the Web",
  manifest: "/manifest.json",
  themeColor: "#E8AEFC",
  applicationName: "Nemmy",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.className} overflow-x-hidden`}>
        <Providers>
          <SessionContextProvider>
            <NavbarContextProvider>
              <PostContextProvider>
                <Navbar />
                <main className={`min-h-screen overflow-x-hidden`}>
                  {children}
                </main>
              </PostContextProvider>
            </NavbarContextProvider>
          </SessionContextProvider>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
