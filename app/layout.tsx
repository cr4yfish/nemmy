import './globals.css'
import { Inter, Montserrat } from 'next/font/google'
import 'material-icons/iconfont/material-icons.css';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
  title: 'Nemmy',
  description: 'A Lemmy Client for the Web',
}

import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Navbar />
        {children}
        <Analytics />
        </body> 
    </html>
  )
}
