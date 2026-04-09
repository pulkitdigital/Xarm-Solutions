'use client';
import { Bell, Search } from 'lucide-react';

export default function Header({ title, subtitle, actions }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur border-b border-[#1e2530] px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-white font-semibold text-base leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="w-8 h-8 rounded-lg bg-[#1a2030] text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors">
          <Bell size={14} />
        </button>
      </div>
    </header>
  );
}