'use client';

import React, {useEffect, useState, useCallback} from 'react';
import {
  getAllBooks,
  getCurrentUser,
  getUserBookmarks,
  getUserReadingProgress,
  toggleUserBookmark,
  INITIAL_BOOKS,
  type Book,
  type ReadingProgress,
  type UserProfile,
} from '@/lib/books-data';
import {SiteHeader} from '@/components/navigation/site-header';
import {HeroSection} from '@/components/home/hero-section';
import {BookGrid} from '@/components/home/book-grid';
import {SiteFooter} from '@/components/navigation/site-footer';
import {RequestBookModal} from '@/components/home/request-book-modal';

export function HomeClient() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Map<string, ReadingProgress>>(
    new Map()
  );
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [authPromptBook, setAuthPromptBook] = useState<Book | null>(null);

  const syncData = useCallback(() => {
    const loadedBooks = getAllBooks();
    setBooks(loadedBooks);

    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const bms = getUserBookmarks(currentUser.id);
      setBookmarkedIds(new Set(bms.map((b) => b.book_id)));
      const progs = getUserReadingProgress(currentUser.id);
      const map = new Map<string, ReadingProgress>();
      for (const p of progs) {
        map.set(p.book_id, p);
      }
      setProgressMap(map);
    } else {
      setBookmarkedIds(new Set());
      setProgressMap(new Map());
    }
  }, []);

  useEffect(() => {
    syncData();
    window.addEventListener('3dbook-catalogue-updated', syncData);
    window.addEventListener('3dbook-auth-updated', syncData);
    window.addEventListener('3dbook-bookmarks-updated', syncData);
    window.addEventListener('3dbook-progress-updated', syncData);
    return () => {
      window.removeEventListener('3dbook-catalogue-updated', syncData);
      window.removeEventListener('3dbook-auth-updated', syncData);
      window.removeEventListener('3dbook-bookmarks-updated', syncData);
      window.removeEventListener('3dbook-progress-updated', syncData);
    };
  }, [syncData]);

  const handleToggleBookmark = (book: Book) => {
    if (!user) {
      setAuthPromptBook(book);
      return;
    }
    toggleUserBookmark(user.id, book.id);
    syncData();
  };

  const featuredBook =
    books.find((b) => b.visibility === 'published') || INITIAL_BOOKS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <SiteHeader onOpenRequestModal={() => setIsRequestModalOpen(true)} />

      <main className="flex-1">
        <HeroSection
          featuredBook={featuredBook}
          onOpenRequestModal={() => setIsRequestModalOpen(true)}
        />

        <BookGrid
          books={books}
          user={user}
          bookmarkedIds={bookmarkedIds}
          progressMap={progressMap}
          onToggleBookmark={handleToggleBookmark}
          onOpenRequestModal={() => setIsRequestModalOpen(true)}
          authPromptBook={authPromptBook}
          onDismissAuthPrompt={() => setAuthPromptBook(null)}
        />
      </main>

      <SiteFooter onOpenRequestModal={() => setIsRequestModalOpen(true)} />

      <RequestBookModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
