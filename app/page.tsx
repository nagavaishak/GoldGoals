'use client';

import { useState } from 'react';
import GoalCard from '@/components/GoalCard';
import CreateGoalModal from '@/components/CreateGoalModal';

const MOCK_GOALS = [
  {
    id: 1,
    title: "Save for Japan trip 🇯🇵",
    creator: "Alice",
    target: 10,
    current: 6.5,
    deadline: "2026-08-15",
    supporters: 8,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
  },
  {
    id: 2,
    title: "Emergency fund safety net",
    creator: "Bob",
    target: 5,
    current: 2.3,
    deadline: "2026-06-01",
    supporters: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
  },
  {
    id: 3,
    title: "Dream wedding 💍",
    creator: "Charlie",
    target: 20,
    current: 14.8,
    deadline: "2026-12-20",
    supporters: 15,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie"
  },
  {
    id: 4,
    title: "Starting my business",
    creator: "Diana",
    target: 15,
    current: 4.2,
    deadline: "2026-10-01",
    supporters: 6,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana"
  },
  {
    id: 5,
    title: "House down payment 🏡",
    creator: "Eve",
    target: 50,
    current: 18.5,
    deadline: "2027-03-15",
    supporters: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve"
  },
  {
    id: 6,
    title: "Master's degree fund",
    creator: "Frank",
    target: 8,
    current: 8,
    deadline: "2026-04-01",
    supporters: 9,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
    completed: true
  },
];

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goals, setGoals] = useState(MOCK_GOALS);

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
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
        <CreateGoalModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
