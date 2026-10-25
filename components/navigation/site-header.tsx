'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {LogIn, User} from 'lucide-react';
import {getCurrentUser, type UserProfile} from '@/lib/books-data';

interface SiteHeaderProps {
  onOpenRequestModal?: () => void;
}

export function SiteHeader({onOpenRequestModal}: SiteHeaderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const syncAuth = () => setUser(getCurrentUser());
    syncAuth();
    window.addEventListener('3dbook-auth-updated', syncAuth);
    return () => window.removeEventListener('3dbook-auth-updated', syncAuth);
  }, []);

  return (
    <header className="relative z-30 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-[#FBF9F5] border-b border-stone-200">
      {/* Zone 1: Single text element wordmark */}
      <Link
        href="/"
        className="text-2xl font-serif-display font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A]"
      >
        3DBook
      </Link>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
      >
        <Link
          href="/#hero"
          className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Home
        </Link>
        <Link
          href="/#catalogue"
          className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Explore
        </Link>
        <Link
          href="/#categories"
          className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Categories
        </Link>
      </nav>

      {/* Zone 3: Actions with standout Log In button */}
      <div className="flex items-center gap-3 shrink-0">
        {onOpenRequestModal ? (
          <button
            type="button"
            onClick={onOpenRequestModal}
            className="px-4 py-2 text-xs font-medium text-stone-800 bg-[#EFECE4] border border-stone-300 rounded-lg hover:bg-stone-200/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            Request a Book
          </button>
        ) : (
          <Link
            href="/#catalogue"
            className="px-4 py-2 text-xs font-medium text-stone-800 bg-[#EFECE4] border border-stone-300 rounded-lg hover:bg-stone-200/80 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            Explore Catalogue
          </Link>
        )}

        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] shadow-sm ring-1 ring-[#1E3A8A]/20 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
        >
          {user ? (
            <>
              <User size={14} className="w-3.5 h-3.5 shrink-0" />
              <span>Account ({user.display_name})</span>
            </>
          ) : (
            <>
              <LogIn size={14} className="w-3.5 h-3.5 shrink-0" />
              <span>Log in</span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
