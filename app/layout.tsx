"use client";

import './globals.css'
import { Inter, Montserrat } from 'next/font/google'
import 'material-icons/iconfont/material-icons.css';
import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from 'react';
import { Person, PersonView } from 'lemmy-js-client';
import { SessionContextProvider } from '@/hooks/auth';

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
  title: 'Nemmy',
  description: 'A Lemmy Client for the Web',
  manifest: '/manifest.json',
  themeColor: '#E8AEFC',
  applicationName: "Nemmy",
}

import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<{ user: PersonView, jwt: string }>();

  return (
    <html lang="en">
      <body className={montserrat.className}>
        <SessionContextProvider>
          <Navbar />
          {children}
        </SessionContextProvider>
        <Analytics />
        </body> 
    </html>
  )
}
