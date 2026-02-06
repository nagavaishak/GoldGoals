'use client';

interface Goal {
  id: number;
  title: string;
  creator: string;
  target: number;
  current: number;
  deadline: string;
  supporters: number;
  avatar: string;
  completed?: boolean;
}

export default function GoalCard({ goal }: { goal: Goal }) {
  const progress = (goal.current / goal.target) * 100;
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
          <button className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-2 rounded-lg font-medium hover:shadow-md transition-all hover:scale-[1.02]">
            🎁 Gift Gold
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}
