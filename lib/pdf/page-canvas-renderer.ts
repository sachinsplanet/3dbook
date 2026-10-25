import type {Book, BookPageContent} from '@/lib/books-data';

/**
 * Renders a high-contrast, high-DPI archival book page onto a 2D HTMLCanvasElement
 * for Three.js CanvasTextures and 2D full-screen spread rendering.
 */
export function renderArchivalPageToCanvas(
  book: Book,
  page: BookPageContent | undefined,
  pageNumber: number,
  width = 1080,
  height = 1440
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const isLeftPage = pageNumber % 2 === 1;

  // 1. Warm archival paper base (slightly toned to prevent specular blowout in 3D lighting)
  ctx.fillStyle = '#F6F3EC';
  ctx.fillRect(0, 0, width, height);

  // Subtle spine gutter shading on inner edge
  const gutterWidth = 110;
  const gutterGrad = ctx.createLinearGradient(
    isLeftPage ? width - gutterWidth : 0,
    0,
    isLeftPage ? width : gutterWidth,
    0
  );
  if (isLeftPage) {
    gutterGrad.addColorStop(0, 'rgba(20, 18, 15, 0)');
    gutterGrad.addColorStop(0.7, 'rgba(20, 18, 15, 0.05)');
    gutterGrad.addColorStop(1, 'rgba(20, 18, 15, 0.18)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(width - gutterWidth, 0, gutterWidth, height);
  } else {
    gutterGrad.addColorStop(0, 'rgba(20, 18, 15, 0.18)');
    gutterGrad.addColorStop(0.3, 'rgba(20, 18, 15, 0.05)');
    gutterGrad.addColorStop(1, 'rgba(20, 18, 15, 0)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(0, 0, gutterWidth, height);
  }

  // Outer editorial border frame
  const padX = 78;
  const padY = 72;
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(padX, padY, width - padX * 2, height - padY * 2);

  const innerX = padX + 48;
  const innerW = width - (padX + 48) * 2;
  let cursorY = padY + 58;

  // Running header
  ctx.fillStyle = '#44403C';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  const runningHeader = (
    page?.chapterTitle ||
    `${book.category.toUpperCase()} · ${book.accession_number}`
  ).toUpperCase();
  ctx.fillText(runningHeader, innerX, cursorY);

  cursorY += 22;
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(innerX, cursorY);
  ctx.lineTo(innerX + innerW, cursorY);
  ctx.stroke();

  if (!page) {
    cursorY += 160;
    ctx.fillStyle = '#292524';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`End Paper — Page ${pageNumber}`, innerX, cursorY);
    return canvas;
  }

  // Primary Page Heading
  cursorY += 68;
  ctx.fillStyle = '#0F0E0D';
  ctx.font = '700 46px "Cormorant Garamond", Georgia, serif';
  cursorY = wrapText(ctx, page.heading, innerX, cursorY, innerW, 54);

  if (page.subHeading) {
    cursorY += 12;
    ctx.fillStyle = book.cover_palette.accent;
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    cursorY = wrapText(ctx, page.subHeading, innerX, cursorY, innerW, 32);
  }

  cursorY += 32;

  // Body paragraphs (high contrast ink for effortless reading)
  ctx.fillStyle = '#1C1917';
  ctx.font = '400 25px "Plus Jakarta Sans", Georgia, serif';
  for (const para of page.bodyParagraphs) {
    cursorY = wrapText(ctx, para, innerX, cursorY, innerW, 40);
    cursorY += 24;
  }

  // Optional Pull Quote
  if (page.pullQuote) {
    cursorY += 12;
    ctx.strokeStyle = 'rgba(28, 25, 23, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(innerX, cursorY);
    ctx.lineTo(innerX + innerW, cursorY);
    ctx.stroke();

    cursorY += 42;
    ctx.fillStyle = book.cover_palette.accent;
    ctx.font = 'italic 600 30px "Cormorant Garamond", Georgia, serif';
    cursorY = wrapText(
      ctx,
      page.pullQuote,
      innerX + 16,
      cursorY,
      innerW - 32,
      40
    );

    cursorY += 14;
    ctx.beginPath();
    ctx.moveTo(innerX, cursorY);
    ctx.lineTo(innerX + innerW, cursorY);
    ctx.stroke();
    cursorY += 36;
  }

  // Optional Vector Technical Diagram
  if (page.diagramType && cursorY < height - 340) {
    const boxH = Math.min(290, height - cursorY - 175);
    if (boxH >= 150) {
      drawTechnicalPlate(
        ctx,
        page.diagramType,
        innerX,
        cursorY,
        innerW,
        boxH,
        book.cover_palette.accent
      );
      cursorY += boxH + 34;
    }
  }

  // Figure caption
  if (page.figureCaption && cursorY < height - 140) {
    ctx.fillStyle = '#44403C';
    ctx.font = 'italic 600 21px "Cormorant Garamond", Georgia, serif';
    cursorY = wrapText(ctx, page.figureCaption, innerX, cursorY, innerW, 28);
  }

  // Footnote & Folio at bottom
  const footerY = height - padY - 34;
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(innerX, footerY - 32);
  ctx.lineTo(innerX + innerW, footerY - 32);
  ctx.stroke();

  if (page.footnote) {
    ctx.fillStyle = '#44403C';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(page.footnote.slice(0, 74), innerX, footerY - 6);
  }

  ctx.fillStyle = '#0F0E0D';
  ctx.font = '600 19px "JetBrains Mono", monospace';
  const folioStr = String(pageNumber).padStart(2, '0');
  const metrics = ctx.measureText(folioStr);
  ctx.fillText(folioStr, innerX + innerW - metrics.width, footerY - 6);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawTechnicalPlate(
  ctx: CanvasRenderingContext2D,
  type: NonNullable<BookPageContent['diagramType']>,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string
) {
  ctx.save();
  ctx.fillStyle = '#ECE7DC';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.2;

  if (type === 'arch-vault') {
    const archR = Math.min(w * 0.28, h * 0.65);
    ctx.beginPath();
    ctx.arc(cx, y + h - 24, archR, Math.PI, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, y + h - 24, archR * 0.72, Math.PI, 0);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(28, 25, 23, 0.55)';
    ctx.setLineDash([6, 6]);
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, y + h - 24 - archR);
      ctx.lineTo(cx + i * 58, y + h - 24);
      ctx.stroke();
    }
  } else if (type === 'orbital-ellipse') {
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.36, h * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();

    const focusX = cx - w * 0.16;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(focusX, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(28, 25, 23, 0.45)';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const px = cx + Math.cos(a) * w * 0.36;
      const py = cy + Math.sin(a) * h * 0.34;
      ctx.beginPath();
      ctx.moveTo(focusX, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
  } else if (type === 'botanical-stem') {
    for (let petals = 0; petals < 8; petals++) {
      const angle = (petals * Math.PI) / 4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(38, 0, 34, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (type === 'swiss-grid') {
    const cols = 6;
    const gap = 12;
    const colW = (w - 64 - gap * (cols - 1)) / cols;
    for (let c = 0; c < cols; c++) {
      const gx = x + 32 + c * (colW + gap);
      ctx.strokeRect(gx, y + 24, colW, h - 48);
    }
  } else if (type === 'bathymetric-chart') {
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        w * 0.1 * i,
        h * 0.09 * i,
        0.18 * i,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  } else if (type === 'escapement-gear') {
    const r = Math.min(w, h) * 0.32;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    for (let t = 0; t < 15; t++) {
      const ang = (t * Math.PI * 2) / 15;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r * 0.35, cy + Math.sin(ang) * r * 0.35);
      ctx.lineTo(
        cx + Math.cos(ang + 0.08) * (r + 14),
        cy + Math.sin(ang + 0.08) * (r + 14)
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}
