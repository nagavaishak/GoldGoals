'use client';

import { useState } from 'react';
import { Goal } from '@/types/goal';

interface GoalCardProps {
  goal: Goal;
  onGiftSent?: (goalId: number, amount: number) => void;
  goldPricePerGram?: number;
}

export default function GoalCard({ goal, onGiftSent, goldPricePerGram = 65 }: GoalCardProps) {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = (goal.current / goal.target) * 100;
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleGiftGold = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: 'demo_user', // In production, get from auth
          goalId: goal.id,
          amount: parseFloat(giftAmount),
          message: giftMessage
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send gift');
      }

      // Notify parent component
      if (onGiftSent) {
        onGiftSent(goal.id, parseFloat(giftAmount));
      }

      // Reset and close modal
      setGiftAmount('');
      setGiftMessage('');
      setShowGiftModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
      goal.completed ? 'border-green-200' : 'border-amber-100'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={goal.avatar}
              alt={goal.creator}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{goal.title}</h3>
              <p className="text-sm text-gray-500">{goal.creator}</p>
            </div>
          </div>
          {goal.completed && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
              ✓ Completed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-amber-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                goal.completed 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Current</div>
            <div className="font-bold text-amber-700">{goal.current}g gold</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Target</div>
            <div className="font-bold text-amber-700">{goal.target}g gold</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>🤝</span>
            <span>{goal.supporters} supporters</span>
          </div>
          {!goal.completed && (
            <div className="text-sm text-gray-500">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowGiftModal(true)}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-2 rounded-lg font-medium hover:shadow-md transition-all hover:scale-[1.02]"
          >
            🎁 Gift Gold
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            ❤️
          </button>
        </div>
      </div>

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Gift Gold</h3>
              <button
                onClick={() => setShowGiftModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Send gold to <span className="font-semibold text-amber-600">{goal.creator}</span>'s goal
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {goal.current}g / {goal.target}g ({progress.toFixed(0)}% complete)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleGiftGold} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (grams of gold)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="e.g., 0.5"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  min="0.001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ~${(parseFloat(giftAmount || '0') * goldPricePerGram).toFixed(2)} USD
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  placeholder="Add a supportive message..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Gift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
