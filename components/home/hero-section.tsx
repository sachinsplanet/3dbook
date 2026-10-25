'use client';

import React from 'react';
import type {Book} from '@/lib/books-data';

interface HeroSectionProps {
  featuredBook?: Book;
  onOpenRequestModal?: () => void;
}

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4';

export function HeroSection(_props: HeroSectionProps) {
  const handleSmoothScrollToGrid = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLHeadingElement>
  ) => {
    e.preventDefault();
    const target = document.getElementById('catalogue');
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative w-full min-h-[540px] sm:min-h-[620px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-stone-200 bg-[#161412]"
    >
      {/* Background Video */}
      <video
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Primary Headline with Smooth Scroll to Book Grid */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 lg:px-10 text-center">
        <a
          href="#catalogue"
          onClick={handleSmoothScrollToGrid}
          className="inline-block group focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white rounded-lg"
          aria-label="Books Feel Better When You Flip It — Scroll to Book Grid"
        >
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-serif-display font-semibold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)] group-hover:text-stone-100 transition-colors cursor-pointer"
            style={{textWrap: 'balance'}}
          >
            Books Feel Better When You Flip It
          </h1>
        </a>
      </div>
    </section>
  );
}
