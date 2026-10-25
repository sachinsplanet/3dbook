'use client';

import React from 'react';
import Link from 'next/link';
import {Bookmark, BookOpen, ExternalLink} from 'lucide-react';
import type {Book} from '@/lib/books-data';
import {BookCoverArt} from '@/components/home/book-cover-art';

interface BookCardProps {
  book: Book;
  isBookmarked: boolean;
  readingProgressPage?: number;
  onToggleBookmark: (book: Book) => void;
}

export function BookCard({
  book,
  isBookmarked,
  readingProgressPage,
  onToggleBookmark,
}: BookCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-xl bg-white border border-stone-200/90 p-4 transition-colors hover:border-stone-400">
      <div>
        {/* Book Cover Link preserving 3:4 aspect ratio */}
        <Link
          href={`/read/${book.slug}`}
          className="block overflow-hidden rounded-lg border border-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
        >
          <div className="transition-transform duration-200 group-hover:scale-[1.015]">
            <BookCoverArt book={book} />
          </div>
        </Link>

        {/* Unboxed Zero-Pill Metadata Line */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs text-stone-500 truncate">
          <span>{book.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{book.page_count} pp.</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{book.rights_status}</span>
        </div>

        {/* Title & Author */}
        <h3 className="mt-1.5 text-lg font-serif-display font-semibold text-stone-900 leading-snug line-clamp-1">
          <Link
            href={`/read/${book.slug}`}
            className="hover:text-[#1E3A8A] transition-colors"
          >
            {book.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-stone-600 truncate">{book.author}</p>

        {/* Optional quiet reading progress or embed indicator */}
        {readingProgressPage && readingProgressPage > 1 ? (
          <p className="mt-2 text-xs font-mono-tabular text-[#1E3A8A]">
            Last read: Page {readingProgressPage} of {book.page_count}
          </p>
        ) : book.embed_url ? (
          <p className="mt-2 text-xs text-stone-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">External 3D Flipbook Embedded</span>
          </p>
        ) : (
          <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <Link
          href={`/read/${book.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {readingProgressPage && readingProgressPage > 1
              ? `Resume (p. ${readingProgressPage})`
              : 'Read Book'}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => onToggleBookmark(book)}
          aria-label={
            isBookmarked
              ? `Remove ${book.title} from bookmarks`
              : `Bookmark ${book.title}`
          }
          title={isBookmarked ? 'Saved in library' : 'Save to library'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isBookmarked
              ? 'bg-stone-900 border-stone-900 text-white'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Bookmark
            className="w-4 h-4"
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>
    </article>
  );
}
