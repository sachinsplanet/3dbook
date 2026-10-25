'use client';

import React, {useState} from 'react';
import {X, BookPlus, CheckCircle2, AlertCircle} from 'lucide-react';
import {saveBookRequest, getCurrentUser} from '@/lib/books-data';

interface RequestBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted?: () => void;
}

const REQUEST_CATEGORIES = [
  'Architecture',
  'Natural History',
  'Science',
  'Typography',
  'Cartography',
  'Horology',
  'Literature & Classics',
  'Art & Design',
  'Other',
] as const;

export function RequestBookModal({
  isOpen,
  onClose,
  onRequestSubmitted,
}: RequestBookModalProps) {
  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string>('Architecture');
  const [requesterName, setRequesterName] = useState(
    currentUser?.display_name || ''
  );
  const [requesterEmail, setRequesterEmail] = useState(
    currentUser?.email || ''
  );
  const [referenceUrl, setReferenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCategory('Architecture');
    setReferenceUrl('');
    setNotes('');
    setError(null);
    setSubmittedTitle(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter the book title you would like to request.');
      return;
    }
    if (!author.trim()) {
      setError('Please enter the author or creator of the book.');
      return;
    }
    if (requesterEmail.trim() && !requesterEmail.includes('@')) {
      setError('Please enter a valid email address or leave it blank.');
      return;
    }

    saveBookRequest({
      title: title.trim(),
      author: author.trim(),
      category,
      requester_name: requesterName.trim() || 'Reader',
      requester_email: requesterEmail.trim(),
      reference_url: referenceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSubmittedTitle(title.trim());
    onRequestSubmitted?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-book-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#FBF9F5] border border-stone-300 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-[#F4F0E8]">
          <div className="flex items-center gap-2.5">
            <BookPlus className="w-5 h-5 text-stone-800 shrink-0" />
            <div>
              <h2
                id="request-book-modal-title"
                className="text-2xl font-serif-display font-semibold text-stone-900"
              >
                Request a Book
              </h2>
              <p className="text-xs text-stone-600">
                Suggest a book or public-domain edition to be added to the 3DBook
                reading catalogue.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTitle ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif-display font-semibold text-stone-900">
              Book Request Received
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Thank you for requesting{' '}
              <span className="font-semibold text-stone-900">
                “{submittedTitle}”
              </span>
              . Our editorial team reviews rights clearance and prepares 3D
              flipbook editions for the catalogue.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedTitle(null)}
                className="px-4 py-2.5 text-xs font-medium text-stone-700 bg-stone-200/70 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Request Another Book
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="e.g. The Elements of Euclid"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Author / Creator *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Oliver Byrne"
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
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                >
                  {REQUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="reader@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Edition / Source Link (Optional)
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://archive.org/..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Notes or Reason for Request (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about a specific edition, translation, or public-domain source..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Submit Book Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
