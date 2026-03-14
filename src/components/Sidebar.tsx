import React from 'react';
import { LayoutDashboard, Users, Grid, Settings, HelpCircle, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
    const navItems = [
        { id: 'dashboard', label: 'Vue Globale', icon: LayoutDashboard },
        { id: 'matrix', label: 'Calibration (9-Box)', icon: Grid },
        { id: 'directory', label: 'Inbox & Approbations', icon: Users },
    ];

    return (
        <div className="w-64 flex-shrink-0 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col pt-6 z-20 shadow-xl">
            <div className="px-6 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
                    CO
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">CORICA</h1>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Talent Cloud</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-4">Applications</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentTab(item.id)}
                            className={twMerge(
                                clsx(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                                    isActive ? "bg-slate-800/80 text-white border border-slate-700/50" : "text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent"
                                )
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
                            )}
                            <Icon size={18} className={isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <Settings size={18} className="text-slate-500" /> Préférences
                </button>
                <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <HelpCircle size={18} className="text-slate-500" /> Support
                </button>
            </div>

            <div className="p-4 bg-black/20 m-4 rounded-xl flex items-center gap-3 border border-white/5 cursor-pointer hover:bg-black/40 transition-colors">
                <img src="https://i.pravatar.cc/150?u=admin" className="w-9 h-9 rounded-full ring-2 ring-orange-500/50" alt="User" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">SVP Ressources</p>
                    <p className="text-xs text-slate-400 truncate">Admin</p>
                </div>
                <LogOut size={16} className="text-slate-500 hover:text-red-400" />
            </div>
        </div>
    );
}
