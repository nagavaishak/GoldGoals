'use client';

import { useState } from 'react';
import { CreateGoalRequest } from '@/types/goal';

interface CreateGoalModalProps {
  onClose: () => void;
  onGoalCreated?: (goal: any) => void;
  goldPricePerGram?: number;
}

export default function CreateGoalModal({ onClose, onGoalCreated, goldPricePerGram = 65 }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    deadline: '',
    autoSave: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    amount: '',
    visibility: 'public' as 'public' | 'private'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateGoalRequest = {
        title: formData.title,
        userId: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '_'), // Generate userId from title
        target: parseFloat(formData.target),
        deadline: formData.deadline,
        autoSave: formData.autoSave,
        frequency: formData.autoSave ? formData.frequency : undefined,
        amount: formData.autoSave ? parseFloat(formData.amount) : undefined,
        visibility: formData.visibility
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create goal');
      }

      // Notify parent component
      if (onGoalCreated) {
        onGoalCreated(result.data);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Create New Goal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g., Save for Japan trip 🇯🇵"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Amount (grams of gold)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g., 10"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ~${(parseFloat(formData.target) * goldPricePerGram || 0).toFixed(2)} USD at current gold prices
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          {/* Auto-Save Toggle */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Enable Auto-Save
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoSave: !formData.autoSave })}
                className={`relative w-12 h-6 rounded-full transition ${
                  formData.autoSave ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.autoSave ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Automatically deposit gold on a schedule via GRAIL
            </p>
          </div>

          {formData.autoSave && (
            <div className="space-y-4 pl-4 border-l-2 border-amber-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount per deposit (grams)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="e.g., 0.5"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                <input
                  type="radio"
                  name="visibility"
                  defaultChecked
                  className="w-4 h-4 text-amber-600"
                />
                <div>
                  <div className="font-medium text-gray-800">🌍 Public</div>
                  <div className="text-xs text-gray-600">Anyone can see and support your goal</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="visibility"
                  className="w-4 h-4 text-amber-600"
                />
                <div>
                  <div className="font-medium text-gray-800">🔒 Private</div>
                  <div className="text-xs text-gray-600">Only you can see this goal</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
