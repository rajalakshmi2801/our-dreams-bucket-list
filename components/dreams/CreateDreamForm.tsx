'use client';

import { useState } from 'react';
import { DREAM_CATEGORIES } from '@/lib/categories';

interface Props {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function CreateDreamForm({ onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimated_date: '',
    estimated_cost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description || null,
      category: formData.category || null,
      estimated_date: formData.estimated_date || null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dream Title */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Dream Title <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
          placeholder="e.g., Trip to Kashmir"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base resize-none"
          rows={3}
          placeholder="Describe your dream in detail..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DREAM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: formData.category === cat.id ? '' : cat.id })}
              className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                formData.category === cat.id
                  ? 'border-rose-400 bg-rose-50 shadow-sm'
                  : 'border-gray-100 hover:border-rose-200 bg-white'
              }`}
            >
              <span className="text-xl block">{cat.emoji}</span>
              <span className="text-[11px] text-gray-600 leading-tight block mt-0.5">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date and Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Target Date
          </label>
          <input
            type="date"
            value={formData.estimated_date}
            onChange={(e) => setFormData({ ...formData, estimated_date: e.target.value })}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Budget (₹)
          </label>
          <input
            type="number"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 border border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-rose-400 to-purple-400 text-white rounded-xl font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all"
        >
          Create Dream
        </button>
      </div>
    </form>
  );
}
