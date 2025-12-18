import React from 'react';
import { Bot, Search, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center text-indigo-500 gap-2">
              <Bot className="h-8 w-8" />
              <span className="font-bold text-xl text-white tracking-tight">JGroupTech <span className="text-indigo-400 font-light">LeadHunter</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a href="https://agencia.jgrouptech.com/" target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">
                Ir a la Agencia
             </a>
             <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                JG
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
