import "./globals.css";
import { Montserrat } from "next/font/google";
import "material-symbols";
import { Analytics } from "@vercel/analytics/react";
import { SessionContextProvider } from "@/hooks/auth";
import { Providers } from "./providers";
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Nemmy",
  description: "A Lemmy Client for the Web",
  manifest: "/manifest.json",
  themeColor: "#E8AEFC",
  applicationName: "Nemmy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.className} overflow-x-hidden bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50`}
      >
        <Providers>
          <SessionContextProvider>
            <main className={`min-h-screen overflow-x-hidden`}>{children}</main>
          </SessionContextProvider>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
