import React from 'react';
import * as Icons from 'lucide-react';

/**
 * CategoryCard renders an individual select card on the dashboard.
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.description - The sub-text description
 * @param {string} props.iconName - Name of the Lucide icon to use
 * @param {string} props.colorClass - Custom gradient or border color mapping
 * @param {string} props.difficultyRange - e.g. "Easy to Hard"
 * @param {number} props.questionCount - Total questions available
 * @param {Function} props.onClick - Select handler
 */
export default function CategoryCard({ 
  title, 
  description, 
  iconName, 
  colorClass, 
  difficultyRange,
  questionCount,
  onClick 
}) {
  // Dynamically resolve the Lucide icon component, fall back to Terminal if not found
  const IconComponent = Icons[iconName] || Icons.Terminal;

  return (
    <div 
      onClick={onClick}
      className="glass-panel glass-panel-hover cursor-pointer p-6 rounded-2xl flex flex-col justify-between h-[220px] relative group overflow-hidden"
    >
      {/* Decorative gradient overlay behind the icon on hover */}
      <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${colorClass}`} />

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-6 h-6 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400">
            {difficultyRange}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/60">
        <span className="text-xs font-medium text-slate-500">
          {questionCount} Available Prompts
        </span>
        <div className="flex items-center text-xs font-semibold text-primary-400 group-hover:text-cyan-400 transition-colors">
          <span>Start Practice</span>
          <Icons.ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
