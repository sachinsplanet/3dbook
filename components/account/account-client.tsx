'use client';

import React, {useEffect, useState, useCallback} from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Bookmark,
  LogOut,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import {
  getAllBooks,
  getCurrentUser,
  authenticateUser,
  signOutCurrentUser,
  deleteCurrentUserAccount,
  getUserBookmarks,
  toggleUserBookmark,
  getUserReadingProgress,
  saveBookToCatalogue,
  deleteBookFromCatalogue,
  getBookRequests,
  deleteBookRequest,
  type Book,
  type UserProfile,
  type ReadingProgress,
  type BookmarkRecord,
  type BookRequest,
} from '@/lib/books-data';
import {SiteHeader} from '@/components/navigation/site-header';
import {SiteFooter} from '@/components/navigation/site-footer';
import {BookCoverArt} from '@/components/home/book-cover-art';
import {EmbedUploadModal} from '@/components/home/embed-upload-modal';
import {RequestBookModal} from '@/components/home/request-book-modal';

type AuthMode = 'signin' | 'signup' | 'reset';
type AccountTab = 'library' | 'bookmarks' | 'requests' | 'publish';

export function AccountClient() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [progressList, setProgressList] = useState<ReadingProgress[]>([]);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AccountTab>('library');
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  const syncAccountData = useCallback(() => {
    const allBooks = getAllBooks();
    setBooks(allBooks);
    setBookRequests(getBookRequests());
    const curUser = getCurrentUser();
    setUser(curUser);
    if (curUser) {
      setBookmarks(getUserBookmarks(curUser.id));
      setProgressList(getUserReadingProgress(curUser.id));
    } else {
      setBookmarks([]);
      setProgressList([]);
    }
  }, []);

  useEffect(() => {
    syncAccountData();
    window.addEventListener('3dbook-auth-updated', syncAccountData);
    window.addEventListener('3dbook-catalogue-updated', syncAccountData);
    window.addEventListener('3dbook-bookmarks-updated', syncAccountData);
    window.addEventListener('3dbook-progress-updated', syncAccountData);
    window.addEventListener('3dbook-requests-updated', syncAccountData);
    return () => {
      window.removeEventListener('3dbook-auth-updated', syncAccountData);
      window.removeEventListener('3dbook-catalogue-updated', syncAccountData);
      window.removeEventListener('3dbook-bookmarks-updated', syncAccountData);
      window.removeEventListener('3dbook-progress-updated', syncAccountData);
      window.removeEventListener('3dbook-requests-updated', syncAccountData);
    };
  }, [syncAccountData]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSuccessMsg(null);

    if (authMode === 'reset') {
      if (!email.trim() || !email.includes('@')) {
        setAuthError('Please enter a valid email address.');
        return;
      }
      setResetSuccessMsg(
        'If an account is associated with that email address, password reset instructions have been dispatched.'
      );
      return;
    }

    const res = authenticateUser(email, password, authMode, displayName);
    if (res.error) {
      setAuthError(res.error);
      return;
    }
    setEmail('');
    setPassword('');
    setDisplayName('');
    syncAccountData();
  };

  const handleToggleVisibility = (targetBook: Book) => {
    const nextVis =
      targetBook.visibility === 'published' ? 'draft' : 'published';
    const updated: Book = {
      ...targetBook,
      visibility: nextVis,
      published_at:
        nextVis === 'published' ? new Date().toISOString() : null,
    };
    saveBookToCatalogue(updated);
    syncAccountData();
  };

  const bookMap = new Map(books.map((b) => [b.id, b]));

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <SiteHeader onOpenRequestModal={() => setIsRequestModalOpen(true)} />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-[1140px] px-6 lg:px-10">
          {!user ? (
            <div className="mx-auto max-w-md rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="text-xs font-mono-tabular uppercase tracking-widest text-stone-500">
                Reader Account & Library
              </div>
              <h1 className="mt-1 text-3xl font-serif-display font-semibold text-stone-900">
                {authMode === 'signin' && 'Sign in to 3DBook'}
                {authMode === 'signup' && 'Create your 3DBook account'}
                {authMode === 'reset' && 'Reset your password'}
              </h1>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Save your reading progress across monographs, bookmark books,
                and access the administrator PDF & 3D flipbook publishing
                pipeline.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setResetSuccessMsg(null);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                    setResetSuccessMsg(null);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('reset');
                    setAuthError(null);
                    setResetSuccessMsg(null);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    authMode === 'reset'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Reset Password
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Clara Vance"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@example.com"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                {authMode !== 'reset' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Password (min. 6 characters) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {authError && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {resetSuccessMsg && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resetSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {authMode === 'signin' && 'Sign In'}
                  {authMode === 'signup' && 'Create Account'}
                  {authMode === 'reset' && 'Send Reset Instructions'}
                </button>
              </form>

              <p className="mt-5 pt-4 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                Privacy notice: Only your email, display name, bookmarks, and
                reading progress are stored. You can delete your account and
                records at any time.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-mono-tabular">
                    <span>Signed In</span>
                    <span aria-hidden="true">·</span>
                    <span>{user.email}</span>
                    <span aria-hidden="true">·</span>
                    <span>Role: {user.role.toUpperCase()}</span>
                  </div>
                  <h1 className="mt-1.5 text-3xl sm:text-4xl font-serif-display font-semibold text-stone-900">
                    Welcome back, {user.display_name}
                  </h1>
                  <p className="mt-1 text-sm text-stone-600">
                    Manage your reading progress, saved bookmarks, and published
                    3D flipbooks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEmbedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF / Embed 3D Flipbook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      signOutCurrentUser();
                      syncAccountData();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-700 bg-stone-100 border border-stone-300 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'library'
                      ? 'bg-[#1C1917] text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Reading Progress ({progressList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'bookmarks'
                      ? 'bg-[#1C1917] text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Saved Bookmarks ({bookmarks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'requests'
                      ? 'bg-[#1C1917] text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Book Requests ({bookRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('publish')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'publish'
                      ? 'bg-[#1C1917] text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Publishing & 3D Embeds ({books.length})
                </button>
              </div>

              {activeTab === 'library' && (
                <div className="space-y-4">
                  {progressList.length === 0 ? (
                    <div className="rounded-xl bg-white border border-stone-200 p-10 text-center">
                      <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <h2 className="text-xl font-serif-display font-semibold text-stone-900">
                        No reading history yet
                      </h2>
                      <p className="mt-1 text-sm text-stone-600">
                        Open any monograph from the catalogue and turn pages to
                        automatically record your reading position.
                      </p>
                      <Link
                        href="/#catalogue"
                        className="mt-5 inline-block px-4 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        Browse Catalogue
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {progressList.map((prog) => {
                        const b = bookMap.get(prog.book_id);
                        if (!b) return null;
                        const pct = Math.min(
                          100,
                          Math.round((prog.current_page / b.page_count) * 100)
                        );
                        return (
                          <div
                            key={prog.book_id}
                            className="rounded-xl bg-white border border-stone-200 p-4 flex items-center gap-4"
                          >
                            <div className="w-20 shrink-0 rounded overflow-hidden border border-stone-200">
                              <BookCoverArt book={b} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-stone-500 font-mono-tabular">
                                {b.category} · Page {prog.current_page} of{' '}
                                {b.page_count} ({pct}%)
                              </div>
                              <h3 className="mt-0.5 text-lg font-serif-display font-semibold text-stone-900 truncate">
                                {b.title}
                              </h3>
                              <p className="text-xs text-stone-600 truncate">
                                {b.author}
                              </p>
                              <div className="mt-3 w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1E3A8A]"
                                  style={{width: `${pct}%`}}
                                />
                              </div>
                              <div className="mt-3">
                                <Link
                                  href={`/read/${b.slug}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Resume at Page {prog.current_page}</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="space-y-4">
                  {bookmarks.length === 0 ? (
                    <div className="rounded-xl bg-white border border-stone-200 p-10 text-center">
                      <Bookmark className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <h2 className="text-xl font-serif-display font-semibold text-stone-900">
                        No saved bookmarks yet
                      </h2>
                      <p className="mt-1 text-sm text-stone-600">
                        Click the bookmark icon on any book card or inside the
                        full-screen reader to save it here.
                      </p>
                      <Link
                        href="/#catalogue"
                        className="mt-5 inline-block px-4 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        Explore Books
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {bookmarks.map((bm) => {
                        const b = bookMap.get(bm.book_id);
                        if (!b) return null;
                        return (
                          <div
                            key={bm.book_id}
                            className="rounded-xl bg-white border border-stone-200 p-4 flex flex-col justify-between"
                          >
                            <div>
                              <Link
                                href={`/read/${b.slug}`}
                                className="block rounded-lg overflow-hidden border border-stone-200"
                              >
                                <BookCoverArt book={b} />
                              </Link>
                              <div className="mt-3 text-xs text-stone-500 font-mono-tabular">
                                {b.category} · {b.page_count} pp.
                              </div>
                              <h3 className="mt-1 text-lg font-serif-display font-semibold text-stone-900 truncate">
                                {b.title}
                              </h3>
                              <p className="text-xs text-stone-600 truncate">
                                {b.author}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                              <Link
                                href={`/read/${b.slug}`}
                                className="flex-1 text-center py-2 px-3 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors"
                              >
                                Read Book
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserBookmark(user.id, b.id);
                                  syncAccountData();
                                }}
                                aria-label={`Remove ${b.title} bookmark`}
                                className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#F4F0E8] border border-stone-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-serif-display font-semibold text-stone-900">
                        Submitted Book Requests
                      </h2>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Books requested by readers for future 3D flipbook
                        publication.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(true)}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Request a Book
                    </button>
                  </div>

                  {bookRequests.length === 0 ? (
                    <div className="rounded-xl bg-white border border-stone-200 p-10 text-center">
                      <h3 className="text-xl font-serif-display font-semibold text-stone-900">
                        No book requests yet
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        Have a book you would like to read in 3DBook? Submit a
                        request using the button above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookRequests.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-xl bg-white border border-stone-200 p-5 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-mono-tabular">
                              <span>{req.category}</span>
                              <span>
                                {new Date(req.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="mt-1 text-lg font-serif-display font-semibold text-stone-900">
                              {req.title}
                            </h3>
                            <p className="text-xs text-stone-600">
                              by {req.author}
                            </p>
                            {req.notes && (
                              <p className="mt-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/70">
                                {req.notes}
                              </p>
                            )}
                          </div>
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                            <span>
                              Requested by {req.requester_name}
                              {req.requester_email
                                ? ` (${req.requester_email})`
                                : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteBookRequest(req.id);
                                syncAccountData();
                              }}
                              aria-label={`Remove request for ${req.title}`}
                              className="p-1.5 rounded text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'publish' && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-[#F4F0E8] border border-stone-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-serif-display font-semibold text-stone-900">
                        Catalogue & 3D Flipbook Embed Management
                      </h2>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Upload permitted PDFs or embed hosted 3D flipbooks.
                        Control draft/published visibility or open any volume in
                        the reader.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmbedModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Add New PDF / 3D Embed</span>
                    </button>
                  </div>

                  <div className="rounded-xl bg-white border border-stone-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-mono-tabular uppercase">
                            <th className="py-3.5 px-4">Title & Author</th>
                            <th className="py-3.5 px-4">Category & Pages</th>
                            <th className="py-3.5 px-4">Source / Embed</th>
                            <th className="py-3.5 px-4">Rights Status</th>
                            <th className="py-3.5 px-4">Visibility</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {books.map((b) => (
                            <tr key={b.id} className="hover:bg-stone-50/80">
                              <td className="py-3.5 px-4">
                                <Link
                                  href={`/read/${b.slug}`}
                                  className="font-serif-display text-base font-semibold text-stone-900 hover:text-[#1E3A8A]"
                                >
                                  {b.title}
                                </Link>
                                <div className="text-stone-500">{b.author}</div>
                              </td>
                              <td className="py-3.5 px-4 font-mono-tabular text-stone-600">
                                {b.category} · {b.page_count} pp.
                              </td>
                              <td className="py-3.5 px-4 text-stone-600">
                                {b.embed_url ? (
                                  <span className="inline-flex items-center gap-1 text-[#1E3A8A]">
                                    <ExternalLink className="w-3 h-3" />
                                    <span>3D Embed URL</span>
                                  </span>
                                ) : b.pdf_storage_key ? (
                                  <span>Uploaded PDF ({b.pdf_filename})</span>
                                ) : (
                                  <span>Archival Monograph</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-stone-600">
                                {b.rights_status}
                              </td>
                              <td className="py-3.5 px-4 font-mono-tabular">
                                {b.visibility === 'published' ? (
                                  <span className="text-emerald-800 font-medium">
                                    Published
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-medium">
                                    Draft
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                                <Link
                                  href={`/read/${b.slug}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Open</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility(b)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                  title="Toggle Draft / Published"
                                >
                                  {b.visibility === 'published' ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      <span>Unpublish</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Publish</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteBookFromCatalogue(b.id);
                                    syncAccountData();
                                  }}
                                  aria-label={`Remove ${b.title}`}
                                  className="inline-flex items-center p-1.5 rounded text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Account Data & Deletion
                  </h3>
                  <p className="text-xs text-stone-500">
                    Permanently delete your account profile, saved bookmarks,
                    and reading progress from this browser.
                  </p>
                </div>
                {!confirmDeleteAccount ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAccount(true)}
                    className="px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        deleteCurrentUserAccount();
                        setConfirmDeleteAccount(false);
                        syncAccountData();
                      }}
                      className="px-3.5 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 cursor-pointer"
                    >
                      Confirm Permanent Deletion
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAccount(false)}
                      className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter onOpenRequestModal={() => setIsRequestModalOpen(true)} />

      <EmbedUploadModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        onBookSaved={syncAccountData}
      />

      <RequestBookModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestSubmitted={syncAccountData}
      />
    </div>
  );
}
