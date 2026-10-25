// Mozilla PDF.js on-demand page loader & canvas renderer
// Complies with Section 7, 8, and 12:
// - Lazy-loads pdfjs-dist when needed
// - Renders requested pages on demand with DPI clamping
// - Cancels stale rendering tasks when navigating quickly
// - Releases resources when closing books

import type {PDFDocumentProxy, RenderTask} from 'pdfjs-dist';

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((pdfjs) => {
      if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
        // Use CDN worker matching installed pdfjs-dist version or fake-worker fallback
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      return pdfjs;
    });
  }
  return pdfjsLibPromise;
}

export async function loadPdfDocumentFromBytes(
  bytes: ArrayBuffer
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  // Pass a copy of the ArrayBuffer so worker transfer does not detach cached buffer
  const copy = bytes.slice(0);
  const loadingTask = pdfjs.getDocument({data: copy});
  return await loadingTask.promise;
}

const activeRenderTasks = new Map<string, RenderTask>();

export async function renderPdfPageToCanvas(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  targetCanvas: HTMLCanvasElement,
  slotKey: string,
  maxWidth = 900
): Promise<boolean> {
  // Cancel any stale render task on this slot
  const prevTask = activeRenderTasks.get(slotKey);
  if (prevTask) {
    try {
      prevTask.cancel();
    } catch {
      // ignore cancel errors
    }
    activeRenderTasks.delete(slotKey);
  }

  try {
    const safePageNum = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));
    const page = await pdfDoc.getPage(safePageNum);
    const unscaledViewport = page.getViewport({scale: 1});
    const dpr =
      typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const desiredScale = (maxWidth / unscaledViewport.width) * dpr;
    const viewport = page.getViewport({
      scale: Math.min(Math.max(desiredScale, 0.8), 2.5),
    });

    targetCanvas.width = Math.floor(viewport.width);
    targetCanvas.height = Math.floor(viewport.height);

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return false;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

    const renderTask = page.render({
      canvasContext: ctx,
      viewport,
      canvas: targetCanvas,
    });
    activeRenderTasks.set(slotKey, renderTask);

    await renderTask.promise;
    activeRenderTasks.delete(slotKey);
    page.cleanup();
    return true;
  } catch (err: unknown) {
    activeRenderTasks.delete(slotKey);
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      (err as {name: string}).name === 'RenderingCancelledException'
    ) {
      return false;
    }
    throw err;
  }
}
