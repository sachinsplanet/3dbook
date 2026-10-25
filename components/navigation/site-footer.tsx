'use client';

import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Instagram,
  Mail,
} from 'lucide-react';

type LegalTab = 'privacy' | 'terms' | 'copyright' | null;

interface SiteFooterProps {
  onOpenRequestModal?: () => void;
}

const WAITLIST_STORAGE_KEY = '3dbook_waitlist_v1';

/**
 * High-DPI Canvas rendering the editorial open 3D book illustration
 * shown in the right column of the waitlist hero in the footer.
 */
function OpenBookIllustrationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 520;
    const h = 360;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // 1. Soft radial warm ambient glow behind book
    const aura = ctx.createRadialGradient(270, 195, 20, 270, 195, 220);
    aura.addColorStop(0, 'rgba(218, 182, 118, 0.28)');
    aura.addColorStop(0.6, 'rgba(218, 182, 118, 0.08)');
    aura.addColorStop(1, 'rgba(246, 243, 235, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);

    // 2. Soft ground shadow under book spine and wings
    const shadowGrad = ctx.createRadialGradient(265, 302, 15, 265, 302, 195);
    shadowGrad.addColorStop(0, 'rgba(72, 54, 30, 0.26)');
    shadowGrad.addColorStop(0.55, 'rgba(72, 54, 30, 0.10)');
    shadowGrad.addColorStop(1, 'rgba(72, 54, 30, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(265, 304, 195, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helper for 4-point sparkle star
    const drawSparkle = (cx: number, cy: number, r: number, color: string) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx - r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawSparkle(108, 118, 6.5, '#C89D54');
    drawSparkle(462, 146, 8.5, '#C49545');
    // Subtle dust motes
    const motes = [
      [165, 65, 1.5],
      [92, 236, 1.5],
      [412, 54, 1.4],
      [446, 76, 1.6],
      [455, 98, 1.4],
    ];
    ctx.fillStyle = '#C6A368';
    for (const [mx, my, mr] of motes) {
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Dark brown hardcover base board under left and right pages
    ctx.fillStyle = '#4B331E';
    ctx.beginPath();
    ctx.moveTo(72, 268);
    ctx.quadraticCurveTo(170, 260, 268, 294);
    ctx.quadraticCurveTo(366, 258, 468, 268);
    ctx.lineTo(466, 254);
    ctx.quadraticCurveTo(366, 246, 268, 282);
    ctx.quadraticCurveTo(170, 248, 74, 254);
    ctx.closePath();
    ctx.fill();

    // 4. Lower page stack thickness (cream-tan layers)
    ctx.fillStyle = '#DFD5BE';
    ctx.beginPath();
    ctx.moveTo(78, 260);
    ctx.quadraticCurveTo(172, 246, 268, 285);
    ctx.quadraticCurveTo(364, 244, 460, 259);
    ctx.lineTo(458, 246);
    ctx.quadraticCurveTo(364, 232, 268, 274);
    ctx.quadraticCurveTo(172, 236, 80, 248);
    ctx.closePath();
    ctx.fill();

    // 5. Left Open Page
    const leftGrad = ctx.createLinearGradient(82, 180, 268, 210);
    leftGrad.addColorStop(0, '#FAF6EC');
    leftGrad.addColorStop(0.75, '#F2EAD7');
    leftGrad.addColorStop(1, '#DFD3BA');
    ctx.fillStyle = leftGrad;
    ctx.strokeStyle = '#D7C9AE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(88, 148);
    ctx.quadraticCurveTo(182, 128, 268, 165);
    ctx.lineTo(268, 278);
    ctx.quadraticCurveTo(176, 238, 82, 250);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved text lines on Left Page
    ctx.strokeStyle = '#CFC3AA';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const yOff = i * 14;
      ctx.beginPath();
      ctx.moveTo(110, 168 + yOff);
      ctx.quadraticCurveTo(180, 153 + yOff, 244, 179 + yOff);
      ctx.stroke();
    }

    // 6. Right Lower Resting Page (underneath the lifted turning page)
    const rightBaseGrad = ctx.createLinearGradient(268, 200, 456, 200);
    rightBaseGrad.addColorStop(0, '#D8CCB4');
    rightBaseGrad.addColorStop(0.3, '#EFE7D4');
    rightBaseGrad.addColorStop(1, '#F8F4E8');
    ctx.fillStyle = rightBaseGrad;
    ctx.strokeStyle = '#D7C9AE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(268, 165);
    ctx.quadraticCurveTo(356, 134, 448, 152);
    ctx.lineTo(456, 248);
    ctx.quadraticCurveTo(364, 232, 268, 278);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 7. Lifted Turning Right Page (creating the 3D flip effect)
    const flipGrad = ctx.createLinearGradient(268, 150, 435, 130);
    flipGrad.addColorStop(0, '#D9CEB8');
    flipGrad.addColorStop(0.18, '#EFE8D5');
    flipGrad.addColorStop(0.65, '#FCF9F2');
    flipGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = flipGrad;
    ctx.strokeStyle = '#DCD0B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(268, 165);
    ctx.bezierCurveTo(286, 96, 358, 68, 434, 74);
    ctx.lineTo(448, 232);
    ctx.bezierCurveTo(372, 212, 310, 234, 268, 278);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved text lines on Lifted Turning Right Page
    ctx.strokeStyle = '#D2C7B0';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const yOff = i * 14;
      ctx.beginPath();
      ctx.moveTo(298, 146 + yOff);
      ctx.quadraticCurveTo(354, 112 + yOff, 412, 118 + yOff);
      ctx.stroke();
    }
  }, []);

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* Top-Left Floating Callout Pill */}
      <div className="absolute top-6 left-2 sm:left-6 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF9F4] border border-[#E6DEC8] shadow-[0_4px_14px_rgba(28,25,23,0.06)] text-xs font-medium text-[#8C5E1A]">
        <span className="w-2 h-2 rounded-full bg-[#D99B26]" />
        <span>3D flip-books</span>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-auto block"
      />

      {/* Bottom-Right Floating Callout Pill */}
      <div className="absolute bottom-3 right-2 sm:right-6 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF9F4] border border-[#E6DEC8] shadow-[0_4px_14px_rgba(28,25,23,0.06)] text-xs font-medium text-[#8C5E1A]">
        <span className="w-2 h-2 rounded-full bg-[#D99B26]" />
        <span>Archival editions</span>
      </div>
    </div>
  );
}

export function SiteFooter({onOpenRequestModal}: SiteFooterProps) {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalTab>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError(null);
    const cleanEmail = waitlistEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setWaitlistError('Please enter a valid email address.');
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(cleanEmail)) {
          list.push(cleanEmail);
          window.localStorage.setItem(
            WAITLIST_STORAGE_KEY,
            JSON.stringify(list)
          );
        }
      }
    } catch {
      // Ignore storage errors
    }

    setWaitlistSubmitted(true);
    setWaitlistEmail('');
  };

  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  return (
    <footer className="relative overflow-hidden rounded-t-[36px] sm:rounded-t-[48px] border-t border-[#E6DFD1] bg-[#F5F2EA] text-[#1C1917] shadow-[0_-12px_40px_rgba(28,25,23,0.04)]">
      <div className="mx-auto max-w-[1220px] px-6 sm:px-10 lg:px-14 pt-14 sm:pt-20 pb-8">
        {/* Top Section: Latest Drops Waitlist & Open 3D Book Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Waitlist CTA */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A6B26]">
              <span className="w-7 h-px bg-[#B9893E]" aria-hidden="true" />
              <span>Latest Drops · Waitlist</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif-display font-medium tracking-tight text-[#171412] leading-[1.05]">
              Be first to turn
              <span className="block italic text-[#A66E1E] font-normal mt-0.5">
                the next page.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#57534E] max-w-md leading-relaxed">
              Join our email waitlist to receive notifications when new 3D flip
              books and archival editions drop.
            </p>

            <div className="pt-1 max-w-md">
              {waitlistSubmitted ? (
                <div className="flex items-center gap-2.5 rounded-full bg-white border border-[#E5DEC9] px-5 py-3.5 text-xs sm:text-sm text-emerald-900 shadow-sm">
                  <CheckCircle2
                    size={18}
                    className="w-4 h-4 text-emerald-700 shrink-0"
                  />
                  <span>
                    You&apos;re on the waitlist! We&apos;ll email you on the
                    next drop.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-2.5">
                  <div className="flex items-center p-1.5 rounded-full bg-white border border-[#E5DEC9] shadow-[0_8px_28px_rgba(154,107,38,0.08)] ring-4 ring-[#EBE5D5]/70">
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email..."
                      aria-label="Enter your email to join the waitlist"
                      className="w-full flex-1 pl-4 sm:pl-5 pr-3 py-2 text-sm bg-transparent text-stone-900 placeholder:text-[#9CA3AF] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171412] hover:bg-stone-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Join Waitlist</span>
                      <ArrowRight size={13} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {waitlistError ? (
                    <p className="pl-4 text-xs text-red-700">{waitlistError}</p>
                  ) : (
                    <p className="pl-4 text-[11px] text-[#78716C]">
                      One email per drop. No spam, unsubscribe anytime.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Open Book Illustration with Callouts */}
          <div className="lg:col-span-6">
            <OpenBookIllustrationCanvas />
          </div>
        </div>

        {/* Ornamental Center Divider with Rotated Diamond */}
        <div className="relative my-12 sm:my-14 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D8CCB6] to-transparent" />
          <div
            aria-hidden="true"
            className="absolute w-2.5 h-2.5 rotate-45 border border-[#C2B295] bg-[#F5F2EA]"
          />
        </div>

        {/* Middle 4-Column Navigation & Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: 3DBook Brand + Rights Pill */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-baseline text-3xl font-serif-display tracking-tight"
            >
              <span className="text-[#B47B26] font-normal">3D</span>
              <span className="text-[#171412] font-semibold">Book</span>
            </Link>

            <p className="text-xs sm:text-[13px] text-[#57534E] max-w-xs leading-relaxed">
              A minimal, tactile digital reading platform turning permitted PDF
              monographs and embedded 3D flipbooks into an immersive physical
              page-turning experience.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFEAD8]/90 border border-[#DFD5BE] text-[11px] font-medium text-[#8C5E1A]">
                <ShieldCheck size={13} className="w-3.5 h-3.5 shrink-0" />
                <span>Public-domain · Original · Licensed editions only</span>
              </div>
            </div>
          </div>

          {/* Column 2: EXPLORE (01–05) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6B26]">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#292524]">
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  01
                </span>
                <Link
                  href="/#hero"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  02
                </span>
                <Link
                  href="/#catalogue"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Published Catalogue
                </Link>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  03
                </span>
                <Link
                  href="/#categories"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Categories & Search
                </Link>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  04
                </span>
                {onOpenRequestModal ? (
                  <button
                    type="button"
                    onClick={onOpenRequestModal}
                    className="hover:text-[#9A6B26] transition-colors cursor-pointer text-left"
                  >
                    Request a Book
                  </button>
                ) : (
                  <Link
                    href="/#catalogue"
                    className="hover:text-[#9A6B26] transition-colors"
                  >
                    Request a Book
                  </Link>
                )}
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  05
                </span>
                <Link
                  href="/account"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Reader Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL & RIGHTS (06–08) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6B26]">
              Legal & Rights
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#292524]">
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  06
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('privacy')}
                  className="hover:text-[#9A6B26] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  07
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('terms')}
                  className="hover:text-[#9A6B26] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  08
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('copyright')}
                  className="hover:text-[#9A6B26] transition-colors cursor-pointer text-left"
                >
                  Copyright & Removal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: READER ACCOUNT (09–11 + Social Circles) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6B26]">
              Reader Account
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#292524]">
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  09
                </span>
                <Link
                  href="/account"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  10
                </span>
                <Link
                  href="/account"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  My Library
                </Link>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[10px] font-serif-display text-[#B59B72] w-4 shrink-0">
                  11
                </span>
                <Link
                  href="/account"
                  className="hover:text-[#9A6B26] transition-colors"
                >
                  Bookmarks
                </Link>
              </li>
            </ul>

            <div className="pt-3 flex items-center gap-2.5">
              <a
                href="#hero"
                aria-label="3DBook on X"
                className="w-8 h-8 rounded-full bg-[#FBF9F4] border border-[#E2DAC9] flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-white transition-colors"
              >
                <X size={13} className="w-3.5 h-3.5" />
              </a>
              <a
                href="#hero"
                aria-label="3DBook on Instagram"
                className="w-8 h-8 rounded-full bg-[#FBF9F4] border border-[#E2DAC9] flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-white transition-colors"
              >
                <Instagram size={13} className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onOpenRequestModal}
                aria-label="Contact or request a book"
                className="w-8 h-8 rounded-full bg-[#FBF9F4] border border-[#E2DAC9] flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
              >
                <Mail size={13} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Colossal 3DBook Watermark Wordmark clipped along the bottom divider */}
        <div
          aria-hidden="true"
          className="mt-10 sm:mt-14 overflow-hidden select-none pointer-events-none border-b border-[#DED6C4]"
        >
          <div
            className="font-serif-display text-center leading-[0.78] tracking-tight text-[21vw] sm:text-[185px] lg:text-[230px] translate-y-[14%]"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(212, 193, 158, 0.55) 0%, rgba(235, 226, 206, 0.18) 85%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '1px rgba(196, 174, 134, 0.45)',
            }}
          >
            3DBook
          </div>
        </div>

        {/* Bottom Copyright & Back-to-Top Row */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#78716C]">
          <p>
            © {new Date().getFullYear()} 3DBook Digital Reading Platform. All
            rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <span>Made for readers, with permission.</span>
            <button
              type="button"
              onClick={handleBackToTop}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FBF9F4] border border-[#DFD7C4] text-[11px] font-medium text-[#1C1917] hover:bg-white transition-colors cursor-pointer shadow-2xs"
            >
              <span>Back to top</span>
              <ArrowUp size={12} className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy Modal so every legal link works predictably */}
      {activeLegalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
        >
          <div className="w-full max-w-xl rounded-xl bg-[#FBF9F5] border border-stone-200 p-6 sm:p-8 shadow-xl text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h2
                id="legal-modal-title"
                className="text-2xl font-serif-display font-semibold text-stone-900"
              >
                {activeLegalModal === 'privacy' && 'Privacy Policy'}
                {activeLegalModal === 'terms' && 'Terms of Service'}
                {activeLegalModal === 'copyright' &&
                  'Copyright & Content Removal Policy'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                aria-label="Close modal"
                className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X size={20} className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-stone-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    3DBook collects only the minimum account and reading-progress
                    information needed to save your bookmarks, current page
                    positions, and uploaded or embedded books.
                  </p>
                  <p>
                    Publicly published books can be read without registration.
                    When signed in, your reading progress and bookmarks are
                    scoped strictly to your user session and can be deleted at
                    any time from the Account page.
                  </p>
                </>
              )}
              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    By using 3DBook, you agree to upload or embed only books and
                    PDF documents for which you hold distribution rights,
                    explicit permission, or verified Public Domain / Creative
                    Commons licenses.
                  </p>
                  <p>
                    Browser-based reading interfaces render visible pages to the
                    client display and cannot guarantee technical DRM prevention
                    against screenshots. Do not upload confidential or
                    unauthorized third-party manuscripts.
                  </p>
                </>
              )}
              {activeLegalModal === 'copyright' && (
                <>
                  <p>
                    A PDF being available online does not automatically permit
                    redistribution. 3DBook publishes only original works,
                    verified public-domain monographs, appropriately licensed
                    works (such as CC BY-SA 4.0), or materials with explicit
                    owner permission.
                  </p>
                  <p>
                    Administrators can unpublish or permanently remove any book
                    immediately from the Account & Publishing console upon
                    rights review.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
