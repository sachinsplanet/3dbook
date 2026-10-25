'use client';

import React, {useMemo, useState} from 'react';
import Link from 'next/link';
import {Search, BookPlus, X} from 'lucide-react';
import type {Book, ReadingProgress, UserProfile} from '@/lib/books-data';
import {BookCard} from '@/components/home/book-card';

interface BookGridProps {
  books: Book[];
  user: UserProfile | null;
  bookmarkedIds: Set<string>;
  progressMap: Map<string, ReadingProgress>;
  onToggleBookmark: (book: Book) => void;
  onOpenRequestModal: () => void;
  authPromptBook: Book | null;
  onDismissAuthPrompt: () => void;
}

const CATEGORIES = [
  'All',
  'Architecture',
  'Natural History',
  'Science',
  'Typography',
  'Cartography',
  'Horology',
  'Custom Embed',
] as const;

type SortMode = 'recent' | 'title-asc' | 'pages-desc';

export function BookGrid({
  books,
  bookmarkedIds,
  progressMap,
  onToggleBookmark,
  onOpenRequestModal,
  authPromptBook,
  onDismissAuthPrompt,
}: BookGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = books.filter((b) => {
      if (b.visibility !== 'published') return false;
      if (selectedCategory !== 'All' && b.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortMode === 'pages-desc') {
        return b.page_count - a.page_count;
      }
      // Recently added
      return (
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
      );
    });
  }, [books, searchQuery, selectedCategory, sortMode]);

  return (
    <section id="catalogue" className="py-16 lg:py-24 bg-[#FBF9F5]">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* Section Heading & Upload/Embed Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono-tabular uppercase tracking-widest">
              <span>Digital Reading Room</span>
              <span aria-hidden="true">·</span>
              <span>{filteredBooks.length} Published Volumes</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-serif-display font-semibold text-stone-900">
              Published Catalogue
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, author, category..."
                aria-label="Search books by title, author, or category"
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1E3A8A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Control */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sort published books"
              className="px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="title-asc">Sort: Title A–Z</option>
              <option value="pages-desc">Sort: Page Count</option>
            </select>

            <button
              type="button"
              onClick={onOpenRequestModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-800 bg-[#EFECE4] border border-stone-300 rounded-lg hover:bg-stone-200/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Request a Book</span>
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Bar (Functional Buttons) */}
        <div
          id="categories"
          className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Book categories"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {cat === 'All' ? 'All Volumes' : cat}
              </button>
            );
          })}
        </div>

        {/* Non-intrusive Sign-In Prompt when logged-out visitor clicks Bookmark */}
        {authPromptBook && (
          <div className="mt-6 rounded-xl bg-[#F4F0E8] border border-stone-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-stone-800">
              <span className="font-semibold">Save bookmarks & progress:</span>{' '}
              Sign in to bookmark{' '}
              <span className="font-serif-display font-semibold italic">
                “{authPromptBook.title}”
              </span>{' '}
              and sync your reading position across sessions.
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/account"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap"
              >
                Sign In / Register
              </Link>
              <button
                type="button"
                onClick={onDismissAuthPrompt}
                className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Books Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        {filteredBooks.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-lg mx-auto">
            <h3 className="text-xl font-serif-display font-semibold text-stone-900">
              No matching books found
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              No published books match “{searchQuery || selectedCategory}”. You
              can reset the filters or request a book to be added.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onOpenRequestModal}
                className="px-4 py-2 text-xs font-medium text-stone-800 bg-stone-100 border border-stone-300 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Request a Book
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={bookmarkedIds.has(book.id)}
                readingProgressPage={progressMap.get(book.id)?.current_page}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
