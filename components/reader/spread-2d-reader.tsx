'use client';

import React, {useEffect, useRef, useState} from 'react';
import type {Book} from '@/lib/books-data';
import {renderArchivalPageToCanvas} from '@/lib/pdf/page-canvas-renderer';

interface Spread2DReaderProps {
  book: Book;
  currentPage: number;
  isSinglePageMobile: boolean;
  pdfPageCanvases: Map<number, HTMLCanvasElement>;
  onTurnPage: (direction: 'prev' | 'next') => void;
}

export function Spread2DReader({
  book,
  currentPage,
  isSinglePageMobile,
  pdfPageCanvases,
  onTurnPage,
}: Spread2DReaderProps) {
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(
    null
  );
  const touchStartXRef = useRef<number | null>(null);

  // Normalize left/right page numbers in 2-page spread mode so left is always odd and right is even
  const maxOddLeft =
    book.page_count % 2 === 0
      ? Math.max(1, book.page_count - 1)
      : book.page_count;
  const leftPageNumber = isSinglePageMobile
    ? currentPage
    : Math.min(
        maxOddLeft,
        currentPage % 2 === 0
          ? Math.max(1, currentPage - 1)
          : Math.max(1, currentPage)
      );
  const rightPageNumber = leftPageNumber + 1;

  useEffect(() => {
    const drawSlot = (target: HTMLCanvasElement | null, pageNum: number) => {
      if (!target) return;
      const customPdfCanvas = pdfPageCanvases.get(pageNum);
      const sourceCanvas =
        customPdfCanvas ||
        renderArchivalPageToCanvas(
          book,
          book.pages[pageNum - 1],
          pageNum,
          1080,
          1440
        );
      target.width = sourceCanvas.width;
      target.height = sourceCanvas.height;
      const ctx = target.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, target.width, target.height);
        ctx.drawImage(sourceCanvas, 0, 0);
      }
    };

    drawSlot(leftCanvasRef.current, leftPageNumber);
    if (!isSinglePageMobile && rightPageNumber <= book.page_count) {
      drawSlot(rightCanvasRef.current, rightPageNumber);
    }
  }, [
    book,
    leftPageNumber,
    rightPageNumber,
    isSinglePageMobile,
    pdfPageCanvases,
  ]);

  const triggerAnimatedTurn = (dir: 'prev' | 'next') => {
    if (flipDirection) return;
    if (dir === 'prev' && leftPageNumber <= 1) return;
    if (
      dir === 'next' &&
      (isSinglePageMobile
        ? leftPageNumber >= book.page_count
        : rightPageNumber >= book.page_count)
    ) {
      return;
    }

    setFlipDirection(dir);
    onTurnPage(dir);
    window.setTimeout(() => {
      setFlipDirection(null);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        triggerAnimatedTurn('next');
      } else {
        triggerAnimatedTurn('prev');
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-screen h-screen flex items-center justify-center p-0 select-none overflow-hidden bg-[#141210]"
    >
      <div
        className={`relative w-screen h-screen flex items-center justify-center transition-transform duration-200 ${
          flipDirection === 'next'
            ? 'scale-[0.995]'
            : flipDirection === 'prev'
              ? 'scale-[0.995]'
              : 'scale-100'
        }`}
      >
        {/* Full-Screen Edge-to-Edge Open Book Spread Container */}
        <div className="relative w-screen h-screen bg-[#231F1C] flex overflow-hidden">
          {/* Left (or Single Mobile) Page */}
          <div
            onClick={() =>
              triggerAnimatedTurn(isSinglePageMobile ? 'next' : 'prev')
            }
            title={
              isSinglePageMobile
                ? 'Click or swipe to turn page'
                : 'Click left page to turn back'
            }
            className="relative flex-1 h-full bg-[#F6F3EC] overflow-hidden cursor-pointer group flex items-center justify-center"
          >
            <canvas
              ref={leftCanvasRef}
              className="w-full h-full object-fill block"
            />
            <div className="pointer-events-none absolute bottom-3 left-4 px-2.5 py-1 rounded bg-black/10 text-xs font-mono-tabular text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
              {isSinglePageMobile ? 'Tap to turn →' : '← Previous Spread'}
            </div>
          </div>

          {/* Central Binding Spine Crease (Desktop/Tablet Spread Mode) */}
          {!isSinglePageMobile && (
            <div
              className="w-3 sm:w-4 h-full shrink-0 z-10"
              style={{
                background:
                  'linear-gradient(90deg, rgba(16,14,12,0.3) 0%, rgba(16,14,12,0.68) 50%, rgba(16,14,12,0.3) 100%)',
              }}
            />
          )}

          {/* Right Spread Page (Desktop/Tablet Spread Mode) */}
          {!isSinglePageMobile && (
            <div
              onClick={() => triggerAnimatedTurn('next')}
              title="Click right page to turn forward"
              className="relative flex-1 h-full bg-[#F6F3EC] overflow-hidden cursor-pointer group flex items-center justify-center"
            >
              {rightPageNumber <= book.page_count ? (
                <canvas
                  ref={rightCanvasRef}
                  className="w-full h-full object-fill block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EFECE4] text-stone-500 font-serif-display italic text-xl">
                  End of Monograph ({book.page_count} pp.)
                </div>
              )}
              <div className="pointer-events-none absolute bottom-3 right-4 px-2.5 py-1 rounded bg-black/10 text-xs font-mono-tabular text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Next Spread →
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
