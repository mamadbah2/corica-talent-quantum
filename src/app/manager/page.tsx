"use client";

import React, { useState } from 'react';
import {
    Bell, LogOut, ChevronDown, CheckSquare,
    User, Users, UploadCloud, FileText, Download, BarChart2,
    AlertTriangle, ShieldCheck, HelpCircle, UserCheck, CheckCircle,
    X, Star, MessageSquare, PenTool, Plus, FilePlus, Trash2, Home, ChevronRight, LayoutDashboard,
    Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { MyProfileMockup } from '@/components/mockups/MyProfileMockup';
import { MyTeamMockup } from '@/components/mockups/MyTeamMockup';
import { NineBoxModal } from '@/components/NineBoxModal';
import { useUser } from '@/context/UserContext';
import { UserAvatar } from '@/components/UserAvatar';
import { DownloadGuideButton } from '@/components/DownloadGuideButton';
import { NavButtons } from '@/components/NavButtons';
import { NotificationBell } from '@/components/NotificationBell';
import { SkillsMatrixModule } from '@/components/skills/SkillsMatrixModule';

type ViewMode = 'MY_PROFILE' | 'MY_TEAM' | 'SKILLS';


export default function ManagerDashboard() {
    const router = useRouter();
    const { currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>('MY_TEAM');
    const [showNineBox, setShowNineBox] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const VIEWS: ViewMode[] = ['MY_TEAM', 'MY_PROFILE', 'SKILLS'];
    const currentViewIndex = VIEWS.indexOf(viewMode);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1]);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#E3E1DB] font-sans">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#463738] text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
                    <CheckCircle size={18} className="text-[#9A9750]" />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}
            {showNineBox && <NineBoxModal onClose={() => setShowNineBox(false)} />}
            {/* Topbar */}
            <header className="h-[76px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <NavButtons onPrev={handlePrevView} onNext={handleNextView} />
                    <CoricaLogo className="h-10 w-auto" />
                    <div className="flex flex-col justify-center mr-4">
                        <h1 className="text-[19px] text-[#463738] font-extrabold tracking-tight leading-none uppercase">Talent Quantum <span className="text-[#F26322]">v8.0</span></h1>
                        <p className="text-[10px] text-[#A39D98] font-bold tracking-widest uppercase">Espace Manager</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-[#463738] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">Manager / Évaluateur</span>
                    <DownloadGuideButton />
                    <NotificationBell />
                    <div className="flex items-center gap-2">
                        <UserAvatar nom={currentUser?.nom_prenoms ?? 'Manager'} size={34} textClassName="text-xs" />
                        <span className="text-[#463738] font-medium">{currentUser?.nom_prenoms ?? 'Manager'}</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors"><Home size={15} className="mb-0.5" /> 🏠 Page d'accueil</span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_TEAM' && 'Mon Équipe'}
                        {viewMode === 'MY_PROFILE' && 'Mon Profil'}
                        {viewMode === 'SKILLS' && 'Compétences Équipe'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-bold text-[#A39D98] mr-2">Espace :</span>
                    <button
                        onClick={() => setViewMode('MY_PROFILE')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_PROFILE' ? 'bg-[#F26322] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <User size={18} /> Mon Profil (Auto-Éval)
                    </button>
                    <button
                        onClick={() => setViewMode('MY_TEAM')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_TEAM' ? 'bg-[#463738] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Users size={18} /> Mon Équipe ({currentUser ? 'N-1 rattachés' : '—'})
                    </button>

                    {/* Bouton conditionnel vers N2 */}
                    {currentUser?.route === '/manager-n2' && (
                        <button
                            onClick={() => router.push('/manager-n2')}
                            className="px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 text-[#F26322] hover:bg-[#F26322]/10 border border-[#F26322]/20"
                        >
                            <Scale size={18} /> Arbitrage & Calibration
                        </button>
                    )}

                    <button
                        onClick={() => setViewMode('SKILLS')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'SKILLS' ? 'bg-[#9A9750] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Star size={18} /> Compétences Équipe
                    </button>

                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setShowNineBox(true)}
                        className="px-5 py-2 font-bold rounded-lg flex items-center gap-2 bg-gradient-to-r from-[#463738] to-[#F26322] text-white shadow-md hover:opacity-90"
                    >
                        <BarChart2 size={18} /> 9-Box Talents
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1400px] mx-auto w-full">

                {/* =======================================================
            VUE : MON PROFIL
        ======================================================= */}
                {viewMode === 'MY_PROFILE' && (
                    <MyProfileMockup />
                )}

                {/* =======================================================
            VUE : MON ÉQUIPE
        ======================================================= */}
                {viewMode === 'MY_TEAM' && (
                    <MyTeamMockup />
                )}

                {viewMode === 'SKILLS' && (
                    <div className="animate-in fade-in duration-300">
                        <SkillsMatrixModule />
                    </div>
                )}

            </main>
        </div>
    );
}
