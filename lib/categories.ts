export const DREAM_CATEGORIES = [
  { id: 'travel', emoji: '✈️', label: 'Travel', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { id: 'date-night', emoji: '🕯️', label: 'Date Night', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'adventure', emoji: '🏔️', label: 'Adventure', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'food', emoji: '🍽️', label: 'Food & Dining', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'home', emoji: '🏠', label: 'Home & Living', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { id: 'wellness', emoji: '💆', label: 'Wellness & Spa', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'fitness', emoji: '🏋️', label: 'Fitness', color: 'bg-lime-50 border-lime-200 text-lime-700' },
  { id: 'movie', emoji: '🎬', label: 'Movies & Shows', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: 'music', emoji: '🎵', label: 'Concert & Music', color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
  { id: 'learning', emoji: '📚', label: 'Learning', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'surprise', emoji: '🎁', label: 'Surprise', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'financial', emoji: '💰', label: 'Financial Goal', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'milestone', emoji: '💍', label: 'Milestone', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'other', emoji: '💫', label: 'Other', color: 'bg-gray-50 border-gray-200 text-gray-700' },
];

export const getCategoryById = (id: string) => DREAM_CATEGORIES.find(c => c.id === id);
