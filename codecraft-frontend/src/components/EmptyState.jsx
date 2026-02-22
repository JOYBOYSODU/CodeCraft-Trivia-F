import React from 'react';
import { Inbox, Search, Trophy, Code, Users, FileQuestion } from 'lucide-react';

const EMPTY_STATE_CONFIG = {
  noProblems: {
    icon: Code,
    title: 'No problems found',
    message: 'Start by creating your first problem or adjust your filters.',
    action: 'Create Problem'
  },
  noContests: {
    icon: Trophy,
    title: 'No contests available',
    message: 'Check back later or create your own contest to get started.',
    action: 'Create Contest'
  },
  noResults: {
    icon: Search,
    title: 'No results found',
    message: 'Try adjusting your search or filter criteria.',
    action: 'Clear Filters'
  },
  noSubmissions: {
    icon: FileQuestion,
    title: 'No submissions yet',
    message: 'Submit your first solution to see your history here.',
    action: null
  },
  noUsers: {
    icon: Users,
    title: 'No users found',
    message: 'No users match your current search criteria.',
    action: null
  },
  default: {
    icon: Inbox,
    title: 'Nothing here yet',
    message: 'Start exploring to see content appear here.',
    action: null
  }
};

export default function EmptyState({ 
  variant = 'default', 
  onAction,
  customIcon,
  customTitle,
  customMessage,
  customAction
}) {
  const config = EMPTY_STATE_CONFIG[variant] || EMPTY_STATE_CONFIG.default;
  const Icon = customIcon || config.icon;
  const title = customTitle || config.title;
  const message = customMessage || config.message;
  const actionText = customAction || config.action;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-6">
        <Icon size={36} className="text-slate-500" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{message}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
