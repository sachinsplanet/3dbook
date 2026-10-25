'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {X, Upload, Link2, CheckCircle2, AlertCircle} from 'lucide-react';
import {
  saveBookToCatalogue,
  storePdfBytes,
  type Book,
  type RightsStatus,
} from '@/lib/books-data';
import {loadPdfDocumentFromBytes} from '@/lib/pdf/pdf-loader';

interface EmbedUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSaved?: (book: Book) => void;
}

/**
 * Extracts clean URL if user pastes either a raw URL or a full <iframe src="..."> snippet
 */
function extractEmbedUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }
  return trimmed;
}

export function EmbedUploadModal({
  isOpen,
  onClose,
  onBookSaved,
}: EmbedUploadModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'embed' | 'pdf'>('embed');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Book['category']>('Custom Embed');
  const [rightsStatus, setRightsStatus] =
    useState<RightsStatus>('Original Work');
  const [embedInput, setEmbedInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedPages, setDetectedPages] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid .pdf document.');
      return;
    }
    if (file.size > 45 * 1024 * 1024) {
      setErrorMsg('PDF file size exceeds the 45 MB browser storage limit.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
    }

    try {
      setIsProcessing(true);
      const buffer = await file.arrayBuffer();
      const pdfDoc = await loadPdfDocumentFromBytes(buffer);
      setDetectedPages(pdfDoc.numPages);
      pdfDoc.cleanup();
    } catch {
      setErrorMsg(
        'Could not parse PDF header. Make sure the file is a valid, unencrypted PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please provide a book title.');
      return;
    }

    const cleanEmbedUrl = extractEmbedUrl(embedInput);
    if (mode === 'embed' && !cleanEmbedUrl) {
      setErrorMsg(
        'Please paste a valid 3D flipbook URL or <iframe> embed code.'
      );
      return;
    }
    if (mode === 'pdf' && !selectedFile) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }

    try {
      setIsProcessing(true);
      const slug =
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
        '-' +
        Math.random().toString(36).slice(2, 6);

      let pdfStorageKey: string | undefined;
      if (mode === 'pdf' && selectedFile) {
        pdfStorageKey = `pdf_${slug}`;
        const bytes = await selectedFile.arrayBuffer();
        await storePdfBytes(pdfStorageKey, bytes);
      }

      const pageCount = mode === 'pdf' ? Math.max(2, detectedPages) : 8;
      const generatedPages = Array.from({length: pageCount}, (_, idx) => ({
        pageNumber: idx + 1,
        chapterTitle: `${category.toUpperCase()} · EDITION`,
        heading:
          idx === 0
            ? title.trim()
            : `Section ${String(idx).padStart(2, '0')} — ${title.trim()}`,
        subHeading: idx === 0 ? `By ${author.trim() || 'Authorized Publisher'}` : undefined,
        bodyParagraphs: [
          description.trim() ||
            'This volume was added through the 3DBook publishing and embed pipeline.',
          mode === 'embed'
            ? `Embedded 3D Flipbook Source: ${cleanEmbedUrl}`
            : `Rendered directly from uploaded PDF file (${selectedFile?.name || 'document.pdf'}).`,
        ],
        diagramType: 'arch-vault' as const,
      }));

      const newBook: Book = {
        id: 'bk_' + Date.now(),
        slug,
        title: title.trim(),
        author: author.trim() || 'Authorized Publisher',
        description:
          description.trim() ||
          'Interactive 3D flipbook edition published on 3DBook.',
        category,
        language: 'English',
        rights_status: rightsStatus,
        visibility: 'published',
        page_count: pageCount,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        accession_number: `ACC. 2026.${Math.floor(10 + Math.random() * 89)}.E`,
        cover_palette: {
          bg: '#ECE8DF',
          surface: '#DED8CA',
          ink: '#1C1917',
          accent: '#1E3A8A',
          motif: 'embed',
        },
        embed_url: mode === 'embed' ? cleanEmbedUrl : undefined,
        pdf_storage_key: pdfStorageKey,
        pdf_filename: selectedFile?.name,
        pages: generatedPages,
      };

      saveBookToCatalogue(newBook);
      onBookSaved?.(newBook);
      onClose();
      router.push(`/read/${newBook.slug}`);
    } catch {
      setErrorMsg('Failed to save book. Please check your file or URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#FBF9F5] border border-stone-200 p-6 sm:p-8 shadow-2xl text-stone-900 my-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-mono-tabular uppercase tracking-widest text-stone-500">
              3DBook Publishing Pipeline
            </p>
            <h2
              id="embed-modal-title"
              className="text-2xl font-serif-display font-semibold text-stone-900 mt-0.5"
            >
              Embed 3D Flipbook or Upload PDF
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-stone-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('embed');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              mode === 'embed'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Embed 3D Flipbook URL / iFrame</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('pdf');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              mode === 'pdf'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF File (PDF.js + 3D)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'embed' ? (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                3D Flipbook Embed URL or &lt;iframe&gt; Code *
              </label>
              <textarea
                rows={3}
                value={embedInput}
                onChange={(e) => setEmbedInput(e.target.value)}
                placeholder='Paste your 3D flipbook URL (e.g. https://heyzine.com/flip-book/...) or full <iframe src="..."></iframe> snippet'
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              />
              <p className="mt-1 text-[11px] text-stone-500">
                Supports any hosted 3D flipbook embed URL or iframe snippet. It
                will open inside the full-screen `/read/[slug]` viewport.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Select Permitted PDF Document (.pdf) *
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl p-5 bg-white hover:border-[#1E3A8A] transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-stone-500 mb-1.5" />
                <span className="text-xs font-medium text-stone-800">
                  {selectedFile
                    ? `${selectedFile.name} (${detectedPages} pages detected)`
                    : 'Click to choose a .pdf file from your device'}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5">
                  Rendered on-demand via Mozilla PDF.js + Three.js 3D Page-Flip
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Alpine Botanical Folio"
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Author / Creator
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Clara Vance"
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Book['category'])
                }
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="Custom Embed">Custom Embed</option>
                <option value="Architecture">Architecture</option>
                <option value="Natural History">Natural History</option>
                <option value="Science">Science</option>
                <option value="Typography">Typography</option>
                <option value="Cartography">Cartography</option>
                <option value="Horology">Horology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Rights Verification
              </label>
              <select
                value={rightsStatus}
                onChange={(e) =>
                  setRightsStatus(e.target.value as RightsStatus)
                }
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="Original Work">Original Work (Owner)</option>
                <option value="Public Domain">Public Domain</option>
                <option value="CC BY-SA 4.0">CC BY-SA 4.0 License</option>
                <option value="Licensed Permission">
                  Explicit Distribution Permission
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise summary for the public catalogue card..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing...'
                  : 'Publish & Open in Full-Screen Reader'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
