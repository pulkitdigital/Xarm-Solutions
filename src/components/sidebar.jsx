'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays, Activity, FileText, ShoppingCart,
  Users, Package, CreditCard, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Events Log', href: '/events-log', icon: CalendarDays },
  { label: 'Events Health', href: '/events-health', icon: Activity },
  { label: 'Client Estimates', href: '/client-estimates', icon: FileText },
  { label: 'Vendor Quotes', href: '/vendor-quotes', icon: ShoppingCart },
  { label: 'Vendor Management', href: '/vendor-management', icon: Users },
  { label: 'Elements Repo', href: '/elements-repo', icon: Package },
  { label: 'Payments', href: '/payments', icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d1117] border-r border-[#1e2530] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e2530]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center">
            <Zap size={14} className="text-black" fill="black" />
          </div>
          <span className="text-white font-bold text-lg tracking-widest uppercase">XARM</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 tracking-wider">Solutions CRM</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg mb-0.5 text-sm transition-all duration-150 ${
                active
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={15} className={active ? 'text-amber-400' : ''} />
              <span className="font-medium">{label}</span>
              {active && <div className="ml-auto w-1 h-4 rounded-full bg-amber-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1e2530]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">A</div>
          <div>
            <p className="text-xs text-slate-300 font-medium">Admin User</p>
            <p className="text-[10px] text-slate-600">Operations</p>
          </div>
        </div>
      </div>
    </aside>
  );
}