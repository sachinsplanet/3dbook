import type {Metadata} from 'next';
import {Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '3DBook — Immersive 3D Page-Flip Reading Platform',
  description:
    'Immersive digital reading platform for 3D page-flipping books, PDF monographs, and embedded 3D flipbooks.',
  openGraph: {
    title: '3DBook — Immersive 3D Page-Flip Reading Platform',
    description:
      'Immersive digital reading platform for 3D page-flipping books, PDF monographs, and embedded 3D flipbooks.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3DBook — Immersive 3D Page-Flip Reading Platform',
    description:
      'Immersive digital reading platform for 3D page-flipping books, PDF monographs, and embedded 3D flipbooks.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-[#FBF9F5] text-[#1C1917] font-sans antialiased selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]"
      >
        {children}
      </body>
    </html>
  );
}
