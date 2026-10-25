'use client';

import React, {useState} from 'react';
import {X, Send, BrainCircuit} from 'lucide-react';
import type {Book} from '@/lib/books-data';

interface DeepAnalysisDrawerProps {
  book: Book;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DeepAnalysisDrawer({
  book,
  currentPage,
  isOpen,
  onClose,
}: DeepAnalysisDrawerProps) {
  const [query, setQuery] = useState('');
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>(
    'gemini-4-argon (High Thinking)'
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const activePageObj =
    book.pages[Math.max(0, Math.min(book.pages.length - 1, currentPage - 1))];

  const runHighThinkingAnalysis = async (customQuery?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          bookTitle: book.title,
          bookAuthor: book.author,
          pageHeading: activePageObj?.heading || `Page ${currentPage}`,
          pageText:
            activePageObj?.bodyParagraphs.join('\n\n') || book.description,
          query:
            customQuery ||
            query.trim() ||
            'Synthesize the core thesis, technical principles, and historical significance of this spread.',
        }),
      });
      const data = await res.json();
      setAnalysisText(data.analysis || 'No analysis generated.');
      if (data.modelUsed) setModelUsed(data.modelUsed);
    } catch {
      setAnalysisText(
        'Unable to reach the server analysis endpoint. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      aria-label="High-Thinking Scholarly Analysis"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#1C1917] border-l border-white/15 text-stone-100 flex flex-col shadow-2xl"
    >
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-base font-serif-display font-semibold text-white">
              Deep Monograph Reasoning
            </h2>
            <p className="text-[11px] font-mono-tabular text-stone-400">
              {modelUsed}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close analysis panel"
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        <div className="rounded-xl bg-stone-900 border border-white/10 p-4 space-y-1.5">
          <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-stone-400">
            Active Spread Context · Page {currentPage}
          </p>
          <p className="font-serif-display text-base font-semibold text-white">
            {activePageObj?.heading || book.title}
          </p>
          <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
            {activePageObj?.bodyParagraphs[0] || book.description}
          </p>
        </div>

        {/* Preset Complex Reasoning Prompts */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-300">
            Quick Deep-Thinking Inquiries:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'First-principles mathematical & structural thesis',
              'Historical provenance & cross-disciplinary context',
              'Critique assumptions & physical trade-offs',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setQuery(preset);
                  runHighThinkingAnalysis(preset);
                }}
                className="px-3 py-1.5 text-xs text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg border border-white/10 transition-colors cursor-pointer text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="rounded-xl bg-stone-900 border border-white/10 p-5 text-xs text-stone-300 space-y-2">
            <p className="font-mono-tabular text-amber-400">
              Reasoning with ThinkingLevel.HIGH (gemini-4-argon)...
            </p>
            <p className="text-stone-400">
              Evaluating structural mechanics and historical citations for page{' '}
              {currentPage}.
            </p>
          </div>
        )}

        {analysisText && !isLoading && (
          <div className="rounded-xl bg-stone-900/90 border border-white/10 p-5 space-y-3">
            <div className="text-xs font-mono-tabular text-stone-400 border-b border-white/10 pb-2">
              Synthesis Result · Page {currentPage}
            </div>
            <div className="text-xs sm:text-sm text-stone-200 whitespace-pre-line leading-relaxed">
              {analysisText}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runHighThinkingAnalysis();
        }}
        className="p-4 border-t border-white/10 bg-stone-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a complex question about this book..."
          className="flex-1 px-3.5 py-2 text-xs bg-[#1C1917] border border-white/15 rounded-lg text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Submit inquiry"
          className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Analyze</span>
        </button>
      </form>
    </aside>
  );
}
