'use client';

import React from 'react';
import type {Book} from '@/lib/books-data';

interface BookCoverArtProps {
  book: Book;
  className?: string;
}

export function BookCoverArt({book, className = ''}: BookCoverArtProps) {
  const {bg, surface, ink, accent, motif} = book.cover_palette;

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden select-none ${className}`}
      style={{backgroundColor: bg, color: ink}}
    >
      {/* Subtle book spine crease & paper edge highlights */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-5 z-20"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 45%, rgba(255,255,255,0.25) 65%, rgba(0,0,0,0.08) 85%, transparent 100%)',
        }}
      />

      {/* Archival vector cover composition */}
      <svg
        viewBox="0 0 360 480"
        className="h-full w-full block"
        aria-label={`Cover illustration for ${book.title}`}
        role="img"
      >
        <rect width="360" height="480" fill={bg} />

        {/* Outer editorial frame */}
        <rect
          x="24"
          y="24"
          width="312"
          height="432"
          fill="none"
          stroke={ink}
          strokeOpacity="0.16"
          strokeWidth="1"
        />

        {/* Inner tinted field */}
        <rect x="42" y="136" width="276" height="236" fill={surface} />
        <rect
          x="42"
          y="136"
          width="276"
          height="236"
          fill="none"
          stroke={ink}
          strokeOpacity="0.18"
          strokeWidth="1"
        />

        {motif === 'arch' && (
          <g transform="translate(180, 254)">
            {/* Architectural Roman travertine vault & solar beam */}
            <path
              d="M -86 90 L -86 -10 A 86 86 0 0 1 86 -10 L 86 90 Z"
              fill={bg}
              stroke={ink}
              strokeWidth="1.5"
            />
            <path
              d="M -56 90 L -56 2 A 56 56 0 0 1 56 2 L 56 90 Z"
              fill="none"
              stroke={accent}
              strokeWidth="1.75"
            />
            <circle cx="0" cy="-48" r="14" fill={accent} />
            <line
              x1="0"
              y1="-34"
              x2="-52"
              y2="90"
              stroke={accent}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="-34"
              x2="0"
              y2="90"
              stroke={accent}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="-34"
              x2="52"
              y2="90"
              stroke={accent}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </g>
        )}

        {motif === 'botanical' && (
          <g transform="translate(180, 254)">
            {/* Botanical radial specimen engraving */}
            <circle
              cx="0"
              cy="0"
              r="82"
              fill="none"
              stroke={ink}
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
              (deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-38"
                  rx="13"
                  ry="36"
                  fill="none"
                  stroke={deg % 60 === 0 ? accent : ink}
                  strokeOpacity={deg % 60 === 0 ? '0.9' : '0.45'}
                  strokeWidth="1.4"
                  transform={`rotate(${deg})`}
                />
              )
            )}
            <circle cx="0" cy="0" r="11" fill={accent} />
          </g>
        )}

        {motif === 'celestial' && (
          <g transform="translate(180, 254)">
            {/* Armillary orbital rings */}
            <ellipse
              cx="0"
              cy="0"
              rx="98"
              ry="42"
              fill="none"
              stroke={accent}
              strokeWidth="1.6"
              transform="rotate(-22)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="98"
              ry="42"
              fill="none"
              stroke={ink}
              strokeOpacity="0.55"
              strokeWidth="1.2"
              transform="rotate(28)"
            />
            <circle
              cx="0"
              cy="0"
              r="68"
              fill="none"
              stroke={ink}
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
            <circle cx="-18" cy="6" r="14" fill={accent} />
            <circle cx="56" cy="-24" r="6" fill={ink} />
          </g>
        )}

        {motif === 'swiss' && (
          <g transform="translate(64, 156)">
            {/* Constructive Swiss grid composition */}
            <rect x="0" y="0" width="106" height="106" fill={accent} />
            <rect
              x="118"
              y="0"
              width="114"
              height="48"
              fill="none"
              stroke={ink}
              strokeWidth="1.5"
            />
            <rect x="118" y="58" width="52" height="48" fill={ink} />
            <rect
              x="180"
              y="58"
              width="52"
              height="48"
              fill="none"
              stroke={ink}
              strokeWidth="1.5"
            />
            <rect
              x="0"
              y="118"
              width="232"
              height="76"
              fill="none"
              stroke={ink}
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="156"
              x2="232"
              y2="156"
              stroke={accent}
              strokeWidth="1.5"
            />
          </g>
        )}

        {motif === 'nautical' && (
          <g transform="translate(180, 254)">
            {/* Bathymetric contours & compass rose */}
            <ellipse
              cx="0"
              cy="0"
              rx="94"
              ry="68"
              fill="none"
              stroke={accent}
              strokeOpacity="0.45"
              strokeWidth="1.2"
              transform="rotate(14)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="70"
              ry="48"
              fill="none"
              stroke={accent}
              strokeOpacity="0.75"
              strokeWidth="1.4"
              transform="rotate(14)"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="42"
              ry="26"
              fill="none"
              stroke={accent}
              strokeWidth="1.8"
              transform="rotate(14)"
            />
            <path
              d="M 0 -76 L 10 -10 L 76 0 L 10 10 L 0 76 L -10 10 L -76 0 L -10 -10 Z"
              fill="none"
              stroke={ink}
              strokeWidth="1.3"
            />
            <circle cx="0" cy="0" r="5" fill={accent} />
          </g>
        )}

        {motif === 'horology' && (
          <g transform="translate(180, 254)">
            {/* Tourbillon cage & escape gear wheel */}
            <circle
              cx="0"
              cy="0"
              r="76"
              fill="none"
              stroke={accent}
              strokeWidth="2"
            />
            <circle
              cx="0"
              cy="0"
              r="54"
              fill="none"
              stroke={ink}
              strokeWidth="1.2"
              strokeDasharray="6 4"
            />
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="none"
              stroke={accent}
              strokeWidth="1.6"
            />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="-24"
                x2="0"
                y2="-76"
                stroke={ink}
                strokeWidth="1.5"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="6" fill={accent} />
          </g>
        )}

        {motif === 'embed' && (
          <g transform="translate(180, 254)">
            {/* 3D isometric open flipbook emblem */}
            <path
              d="M 0 -55 L -82 -35 L -82 55 L 0 35 Z"
              fill={bg}
              stroke={ink}
              strokeWidth="1.6"
            />
            <path
              d="M 0 -55 L 82 -35 L 82 55 L 0 35 Z"
              fill={bg}
              stroke={accent}
              strokeWidth="1.8"
            />
            <path
              d="M 0 -55 L 54 -62 L 54 28 L 0 35 Z"
              fill="none"
              stroke={accent}
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
          </g>
        )}
      </svg>

      {/* Top Editorial Header Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-6 flex flex-col justify-between z-10">
        <div className="flex items-center justify-between text-[10px] font-mono-tabular tracking-widest uppercase opacity-75">
          <span className="truncate">{book.category}</span>
          <span>{book.accession_number}</span>
        </div>
        <div className="mt-2.5">
          <p className="font-serif-display text-lg font-semibold leading-tight line-clamp-2">
            {book.title}
          </p>
          <p className="mt-1 text-[11px] opacity-75 truncate">{book.author}</p>
        </div>
      </div>

      {/* Bottom Colophon Strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 py-4 flex items-center justify-between text-[10px] font-mono-tabular uppercase tracking-wider opacity-75 z-10">
        <span>3DBook Edition</span>
        <span>{book.page_count} pp.</span>
      </div>
    </div>
  );
}
