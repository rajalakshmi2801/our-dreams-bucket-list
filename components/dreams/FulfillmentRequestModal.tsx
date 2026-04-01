'use client';

import { useState } from 'react';

interface Props {
  dreamTitle: string;
  onSubmit: (notes: string) => void;
  onClose: () => void;
}

export default function FulfillmentRequestModal({ dreamTitle, onSubmit, onClose }: Props) {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(notes);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Request Fulfillment</h3>
            <p className="text-sm text-gray-400">{dreamTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              How did you make this dream come true?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent text-base resize-none"
              rows={4}
              placeholder="Tell your partner about it..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
