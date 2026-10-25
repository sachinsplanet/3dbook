'use client';

import React, {useEffect, useState, useCallback, useRef} from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  getBookBySlug,
  getCurrentUser,
  isBookBookmarked,
  toggleUserBookmark,
  getBookProgress,
  saveUserReadingProgress,
  loadPdfBytes,
  type Book,
  type UserProfile,
} from '@/lib/books-data';
import {Book3DStage} from '@/components/three/book-3d-stage';
import {Spread2DReader} from '@/components/reader/spread-2d-reader';
import {playPageTurnSound} from '@/lib/audio/page-turn-sound';
import {
  loadPdfDocumentFromBytes,
  renderPdfPageToCanvas,
} from '@/lib/pdf/pdf-loader';
import type {PDFDocumentProxy} from 'pdfjs-dist';

type ReaderViewMode = '3d' | '2d' | 'embed';

interface BookReaderClientProps {
  slug: string;
}

export function BookReaderClient({slug}: BookReaderClientProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const [viewMode, setViewMode] = useState<ReaderViewMode>('3d');
  const [currentPage, setCurrentPage] = useState(1);
  // True when user is on a mobile/tablet screen currently held in portrait (height > width),
  // so we automatically rotate the reader into full-screen landscape mode.
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  // Reader UX State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // On-demand PDF.js document and rendered canvases
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const [pdfPageCanvases, setPdfPageCanvases] = useState<
    Map<number, HTMLCanvasElement>
  >(new Map());
  const isTurningRef = useRef(false);

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobilePortrait(w < 900 && h > w);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);

  // Keep isFullscreen state synced with browser fullscreen events
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const loadBookAndPdf = useCallback(async () => {
    setIsLoading(true);
    setPdfError(null);

    const found = getBookBySlug(slug);
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!found) {
      setBook(null);
      setIsLoading(false);
      return;
    }

    setBook(found);
    if (found.embed_url) {
      setViewMode('embed');
    }

    if (currentUser) {
      setBookmarked(isBookBookmarked(currentUser.id, found.id));
      const savedProg = getBookProgress(currentUser.id, found.id);
      if (savedProg && savedProg.current_page >= 1) {
        setCurrentPage(Math.min(found.page_count, savedProg.current_page));
      }
    }

    if (found.pdf_storage_key) {
      try {
        const bytes = await loadPdfBytes(found.pdf_storage_key);
        if (!bytes) {
          setPdfError(
            'Uploaded PDF bytes were not found in browser storage. Showing archival spread fallback.'
          );
        } else {
          const pdfDoc = await loadPdfDocumentFromBytes(bytes);
          pdfDocRef.current = pdfDoc;
        }
      } catch {
        setPdfError(
          'Could not render the uploaded PDF file (corrupted or unsupported PDF header).'
        );
      }
    }

    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadBookAndPdf();
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, [loadBookAndPdf]);

  useEffect(() => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc || !book) return;

    let cancelled = false;
    const pagesToRender = [
      currentPage,
      currentPage + 1,
      currentPage - 1,
      currentPage + 2,
    ].filter((p) => p >= 1 && p <= pdfDoc.numPages);

    (async () => {
      for (const pageNum of pagesToRender) {
        if (cancelled) break;
        if (pdfPageCanvases.has(pageNum)) continue;
        const offscreen = document.createElement('canvas');
        try {
          const ok = await renderPdfPageToCanvas(
            pdfDoc,
            pageNum,
            offscreen,
            `slot_${pageNum}`,
            880
          );
          if (ok && !cancelled) {
            setPdfPageCanvases((prev) => {
              const next = new Map(prev);
              next.set(pageNum, offscreen);
              return next;
            });
          }
        } catch {
          // ignore cancelled render
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, book, pdfPageCanvases]);

  const stepIncrement = 2;

  const maxSpreadStartPage = book
    ? book.page_count % 2 === 0
      ? Math.max(1, book.page_count - 1)
      : book.page_count
    : 1;

  const handleTurnPage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!book || isTurningRef.current) return;
      isTurningRef.current = true;
      window.setTimeout(() => {
        isTurningRef.current = false;
      }, 170);

      setCurrentPage((prev) => {
        const next =
          direction === 'next'
            ? Math.min(maxSpreadStartPage, prev + stepIncrement)
            : Math.max(1, prev - stepIncrement);

        if (next !== prev) {
          playPageTurnSound(soundEnabled);
          const activeUser = getCurrentUser();
          if (activeUser) {
            saveUserReadingProgress(
              activeUser.id,
              book.id,
              book.slug,
              next,
              book.page_count
            );
          }
        }
        return next;
      });
    },
    [book, maxSpreadStartPage, stepIncrement, soundEnabled]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleTurnPage('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleTurnPage('prev');
      } else if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTurnPage]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if (
          typeof screen !== 'undefined' &&
          screen.orientation &&
          'lock' in screen.orientation
        ) {
          try {
            await (
              screen.orientation as unknown as {
                lock: (orientation: string) => Promise<void>;
              }
            ).lock('landscape');
          } catch {
            // CSS landscape rotation handles browsers that disallow orientation.lock
          }
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((f) => !f);
    }
  };

  const handleBookmarkClick = () => {
    if (!book) return;
    const activeUser = getCurrentUser();
    if (!activeUser) {
      window.location.href = '/account';
      return;
    }
    const nowSaved = toggleUserBookmark(activeUser.id, book.id);
    setBookmarked(nowSaved);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#161412] text-stone-200 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-2 border-stone-600 border-t-amber-400 animate-spin" />
        <p className="mt-4 font-serif-display text-xl text-white">
          Opening 3DBook Reading Room...
        </p>
        <p className="mt-1 text-xs font-mono-tabular text-stone-400">
          Initializing page-flip engine & document metadata
        </p>
      </div>
    );
  }

  if (!book || (book.visibility !== 'published' && !user)) {
    return (
      <div className="fixed inset-0 bg-[#161412] text-stone-200 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h1 className="text-2xl font-serif-display font-semibold text-white">
          Monograph Unavailable
        </h1>
        <p className="mt-2 text-sm text-stone-400 max-w-md">
          The requested book (“{slug}”) could not be found or has not been
          published to the public catalogue.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-xs font-medium text-stone-900 bg-[#FBF9F5] rounded-lg hover:bg-stone-200 transition-colors"
          >
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isMobilePortrait
          ? 'fixed top-1/2 left-1/2 overflow-hidden bg-[#141210] text-stone-100 select-none'
          : 'fixed inset-0 w-screen h-screen overflow-hidden bg-[#141210] text-stone-100 select-none'
      }
      style={
        isMobilePortrait
          ? {
              width: '100dvh',
              height: '100dvw',
              transform: 'translate(-50%, -50%) rotate(90deg)',
              transformOrigin: 'center center',
            }
          : undefined
      }
    >
      {/* Top-Left Catalogue Bar: automatically hidden in fullscreen or when controls are hidden */}
      {!isFullscreen && !dockCollapsed && (
        <header className="pointer-events-none absolute top-3 left-3 z-30">
          <div className="pointer-events-auto flex items-center gap-3 bg-[#1C1917]/95 border border-white/15 rounded-xl px-3.5 py-2 shadow-lg">
            <Link
              href="/"
              aria-label="Exit reader and return to catalogue"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft size={15} className="w-4 h-4 shrink-0" />
              <span>Catalogue</span>
            </Link>
            <span aria-hidden="true" className="text-stone-600">
              |
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs truncate max-w-[380px]">
              <span className="font-serif-display font-semibold text-white truncate">
                {book.title}
              </span>
              <span aria-hidden="true" className="text-stone-500">
                ·
              </span>
              <span className="text-stone-400 truncate">{book.author}</span>
            </div>
          </div>
        </header>
      )}

      {pdfError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-amber-950/95 border border-amber-500/40 px-4 py-2 text-xs text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{pdfError}</span>
          <button
            type="button"
            onClick={loadBookAndPdf}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-800/80 hover:bg-amber-700 text-white cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Full-Bleed Reading Viewport filling 100% of the landscape stage */}
      <main className="w-full h-full">
        {viewMode === '3d' && (
          <Book3DStage
            book={book}
            currentPage={currentPage}
            pdfPageCanvases={pdfPageCanvases}
            cameraPreset="reading"
            studioFinish="linen"
            explodedFactor={0}
            onPageTurnRequest={handleTurnPage}
            className="w-full h-full"
          />
        )}

        {viewMode === '2d' && (
          <Spread2DReader
            book={book}
            currentPage={currentPage}
            isSinglePageMobile={false}
            pdfPageCanvases={pdfPageCanvases}
            onTurnPage={handleTurnPage}
          />
        )}

        {viewMode === 'embed' && book.embed_url && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <iframe
              src={book.embed_url}
              title={`Embedded 3D Flipbook — ${book.title}`}
              className="w-full h-full border-0 bg-stone-950"
              allowFullScreen
            />
          </div>
        )}
      </main>

      {/* Unified Collapsible Bottom Control Dock */}
      <div
        className="absolute bottom-3 left-1/2 z-30 w-[92%] max-w-[740px] flex flex-col items-center"
        style={{
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% - 28px))'
            : 'translate(-50%, 0)',
          transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="mb-1.5 px-3 py-1 rounded-md bg-[#1C1917]/95 border border-white/15 text-[11px] font-medium text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp size={14} className="w-3.5 h-3.5 shrink-0" />
              <span>Show Reader Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="w-3.5 h-3.5 shrink-0" />
              <span>Hide Controls (H)</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full rounded-xl bg-[#1C1917]/95 border border-white/15 px-3.5 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <button
                type="button"
                onClick={() => handleTurnPage('prev')}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft size={16} className="w-4 h-4" />
              </button>

              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between text-xs font-mono-tabular text-stone-200">
                  <span>
                    Page {currentPage}
                    {viewMode !== 'embed' && currentPage < book.page_count
                      ? `–${Math.min(book.page_count, currentPage + 1)}`
                      : ''}{' '}
                    of {book.page_count}
                  </span>
                  <span className="text-stone-400">
                    {Math.round(
                      (Math.min(book.page_count, currentPage + 1) /
                        book.page_count) *
                        100
                    )}
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={maxSpreadStartPage}
                  step={stepIncrement}
                  value={currentPage}
                  onChange={(e) => {
                    const target = parseInt(e.target.value, 10);
                    setCurrentPage(target);
                    if (user) {
                      saveUserReadingProgress(
                        user.id,
                        book.id,
                        book.slug,
                        target,
                        book.page_count
                      );
                    }
                  }}
                  aria-label="Reading progress page slider"
                  className="w-full accent-amber-500 cursor-pointer h-1.5"
                />
              </div>

              <button
                type="button"
                onClick={() => handleTurnPage('next')}
                disabled={currentPage >= maxSpreadStartPage}
                aria-label="Next page"
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight size={16} className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label={
                  soundEnabled
                    ? 'Mute page-turn sound'
                    : 'Enable page-turn sound'
                }
                className="px-2.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 size={15} className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Sound On</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={15} className="w-4 h-4 text-stone-400" />
                    <span className="hidden sm:inline">Muted</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={
                  bookmarked ? 'Remove bookmark' : 'Bookmark this book'
                }
                title={bookmarked ? 'Bookmarked' : 'Bookmark book'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  bookmarked
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                }`}
              >
                <Bookmark
                  size={15}
                  className="w-4 h-4"
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? 'Exit full screen' : 'Enter full screen'
                }
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
                className="px-2.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 size={15} className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={15} className="w-4 h-4" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
