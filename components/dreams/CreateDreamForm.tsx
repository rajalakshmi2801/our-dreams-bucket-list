'use client';

import { useState } from 'react';

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

  const categories = [
    { id: 'travel', label: '✈️ Travel', color: 'bg-blue-100 text-blue-700' },
    { id: 'adventure', label: '🏔️ Adventure', color: 'bg-orange-100 text-orange-700' },
    { id: 'financial', label: '💰 Financial', color: 'bg-green-100 text-green-700' },
    { id: 'learning', label: '📚 Learning', color: 'bg-purple-100 text-purple-700' },
    { id: 'home', label: '🏠 Home', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'other', label: '✨ Other', color: 'bg-pink-100 text-pink-700' }
  ];

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dream Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dream Title <span className="text-pink-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
          placeholder="e.g., Trip to Paris"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
          rows={4}
          placeholder="Describe your dream in detail..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`p-3 rounded-xl border-2 transition ${
                formData.category === cat.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
              }`}
            >
              <span className="text-lg mb-1 block">{cat.label.split(' ')[0]}</span>
              <span className="text-xs">{cat.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date and Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Date
          </label>
          <input
            type="date"
            value={formData.estimated_date}
            onChange={(e) => setFormData({ ...formData, estimated_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (₹)
          </label>
          <input
            type="number"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 text-base"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-3 bg-gradient-to-r from-rose-400 to-purple-400 text-white rounded-xl font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all"
        >
          Create Dream
        </button>
      </div>
    </form>
  );
}