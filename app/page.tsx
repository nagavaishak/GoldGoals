'use client';

import { useState, useEffect } from 'react';
import GoalCard from '@/components/GoalCard';
import CreateGoalModal from '@/components/CreateGoalModal';
import { Goal } from '@/types/goal';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goldPricePerGram, setGoldPricePerGram] = useState(65);

  const fetchGoldPrice = async () => {
    try {
      const res = await fetch('/api/price');
      const result = await res.json();
      if (result.success && result.data?.pricePerGram) {
        setGoldPricePerGram(result.data.pricePerGram);
      }
    } catch {
      // keep default fallback
    }
  };

  // Fetch goals and price on mount
  useEffect(() => {
    fetchGoals();
    fetchGoldPrice();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch goals');
      }

      setGoals(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = (newGoal: Goal) => {
    setGoals([newGoal, ...goals]);
  };

  const handleGiftSent = (goalId: number, amount: number) => {
    setGoals(goals.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            current: goal.current + amount,
            completed: goal.current + amount >= goal.target
          }
        : goal
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  GoldGoals
                </h1>
                <p className="text-xs text-gray-500">Social savings in gold</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Create Goal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
            Save Together, Win Together
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create public savings goals in gold, challenge friends, and gift gold to celebrate progress.
            Make saving fun and accountable.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
              <div className="text-3xl font-bold text-amber-600">156</div>
              <div className="text-gray-600">Active Goals</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
              <div className="text-3xl font-bold text-amber-600">482g</div>
              <div className="text-gray-600">Gold Saved</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
              <div className="text-3xl font-bold text-amber-600">89</div>
              <div className="text-gray-600">Goals Completed</div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-gray-800">Set Goals</div>
              <div className="text-sm text-gray-600">Public savings targets</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-3xl mb-2">🤝</div>
              <div className="font-semibold text-gray-800">Get Support</div>
              <div className="text-sm text-gray-600">Friends gift gold</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-3xl mb-2">📈</div>
              <div className="font-semibold text-gray-800">Track Progress</div>
              <div className="text-sm text-gray-600">Visual milestones</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold text-gray-800">Celebrate</div>
              <div className="text-sm text-gray-600">Achievements & rewards</div>
            </div>
          </div>
        </div>

        {/* Goals Feed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Community Goals</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition">
                Active
              </button>
              <button className="px-4 py-2 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition">
                Completed
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchGoals}
                className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Goals Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onGiftSent={handleGiftSent} goldPricePerGram={goldPricePerGram} />
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Create Goal</h4>
              <p className="text-sm text-gray-600">Set your target amount in grams of gold and deadline</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Auto-Save</h4>
              <p className="text-sm text-gray-600">Schedule weekly/monthly automatic gold deposits</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Get Support</h4>
              <p className="text-sm text-gray-600">Friends gift gold to celebrate your progress</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Achieve</h4>
              <p className="text-sm text-gray-600">Reach your goal and celebrate with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built with 💛 for the Oro GRAIL Grants Program</p>
            <p className="text-sm">Powered by <span className="text-amber-600 font-semibold">Oro GRAIL API</span> on Solana</p>
          </div>
        </div>
      </footer>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onGoalCreated={handleGoalCreated}
          goldPricePerGram={goldPricePerGram}
        />
      )}
    </div>
  );
}
