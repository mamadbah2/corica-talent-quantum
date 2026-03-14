"use client";

import React, { useState } from 'react';
import {
    Bell, LogOut, CheckSquare,
    Users, BarChart3, AlertTriangle, Scale, Home, ChevronRight, User, BarChart2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { MyProfileMockup } from '@/components/mockups/MyProfileMockup';
import { MyTeamMockup } from '@/components/mockups/MyTeamMockup';
import { NineBoxModal } from '@/components/NineBoxModal';
import { useUser, ALL_USERS } from '@/context/UserContext';
import { UserAvatar } from '@/components/UserAvatar';
import { DownloadGuideButton } from '@/components/DownloadGuideButton';
import { NavButtons } from '@/components/NavButtons';
import { NotificationBell } from '@/components/NotificationBell';

export default function ManagerN2Dashboard() {
    const router = useRouter();
    const { currentUser, addNotification } = useUser();
    const [viewMode, setViewMode] = useState<'N2_DASHBOARD' | 'MY_PROFILE' | 'MY_TEAM'>('N2_DASHBOARD');
    const [showNineBox, setShowNineBox] = useState(false);

    const n2Subordinates = ALL_USERS.filter(u => u.id_evaluateur_n2 === currentUser?.id_usercount);
    const pendingN2 = n2Subordinates.filter(u => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true' &&
                localStorage.getItem(`n2_validated_${u.id_usercount}`) !== 'true';
        }
        return false;
    });

    const VIEWS: ('N2_DASHBOARD' | 'MY_PROFILE' | 'MY_TEAM')[] = ['MY_PROFILE', 'MY_TEAM', 'N2_DASHBOARD'];
    const currentViewIndex = VIEWS.indexOf(viewMode);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1]);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0]);

    return (
        <div className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden">
            {showNineBox && <NineBoxModal onClose={() => setShowNineBox(false)} />}
            {/* Topbar */}
            <header className="h-[76px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <NavButtons onPrev={handlePrevView} onNext={handleNextView} />
                    <CoricaLogo className="h-10 w-auto" />
                    <div className="flex flex-col justify-center mr-4">
                        <h1 className="text-[19px] text-[#463738] font-extrabold tracking-tight leading-none uppercase">Talent Quantum <span className="text-[#F26322]">v8.0</span></h1>
                        <p className="text-[10px] text-[#A39D98] font-bold tracking-widest uppercase">Espace Supervision N+2</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-[#463738] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">Superviseur de Niveaux (N+2)</span>
                    <DownloadGuideButton />
                    <NotificationBell />
                    <div className="flex items-center gap-2">
                        <UserAvatar nom={currentUser?.nom_prenoms ?? 'Manager N2'} size={34} textClassName="text-xs" />
                        <span className="text-[#463738] font-medium">{currentUser?.nom_prenoms ?? 'Manager N2'}</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors"><Home size={15} className="mb-0.5" /> 🏠 Page d'accueil N+2</span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_PROFILE' ? 'Mon Profil' : 'Comité de Calibration N+2'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-bold text-[#A39D98] mr-2">Espace :</span>
                    <button
                        onClick={() => setViewMode('MY_PROFILE')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_PROFILE' ? 'bg-[#9A9750] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <User size={18} /> Mon Profil
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setViewMode('MY_TEAM')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_TEAM' ? 'bg-[#463738] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Users size={18} /> Mon Équipe Directe
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setViewMode('N2_DASHBOARD')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'N2_DASHBOARD' ? 'bg-[#F26322] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Scale size={18} /> Arbitrage & Calibration
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

            {viewMode === 'N2_DASHBOARD' && (
                <div className="bg-[#E3E1DB]/60 px-8 py-2.5 flex items-center gap-2 text-[13px] text-[#463738] border-b border-[#A39D98]/30">
                    <Scale size={18} className="text-[#F26322]" />
                    <span className="font-bold text-[#463738]">Comité de Calibration N+2</span>
                    <span className="font-normal text-[#A39D98]">- Révision et arbitrage des placements 9-Box effectués par vos Managers directes (N+1).</span>
                </div>
            )}

            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1200px] mx-auto w-full">
                {viewMode === 'MY_PROFILE' && <MyProfileMockup />}
                {viewMode === 'MY_TEAM' && <MyTeamMockup />}

                {viewMode === 'N2_DASHBOARD' && (
                    <>
                        <h2 className="text-[28px] font-bold text-[#463738] mb-1">Arbitrage & Calibration</h2>
                        <p className="text-[#A39D98] text-[15px] mb-8">Vue N+2 : Vérifiez la cohérence globale des évaluations de vos départements.</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Liste des validations en entente */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col p-6 animate-in slide-in-from-bottom-5 duration-300">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E3E1DB]">
                                    <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-[#F26322]" /> Demandes d&apos;Arbitrage ({pendingN2.length})
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {pendingN2.length > 0 ? (
                                        pendingN2.map((u, i) => {
                                            const manager = ALL_USERS.find(m => m.id_usercount === u.id_evaluateur);
                                            return (
                                                <div key={i} className="bg-orange-50/50 p-4 rounded-xl border border-orange-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-[#F26322] uppercase">Évalué par : {manager?.nom_prenoms || 'Responsable'}</span>
                                                        <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-[#E3E1DB] text-[#463738]">{u.nom_prenoms}</span>
                                                    </div>
                                                    <p className="text-[#463738] text-sm font-medium mb-4 italic">Évaluation N+1 soumise. Validation N+2 requise pour clôturer le dossier.</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => alert("Consultation du dossier...")} className="flex-1 bg-white text-[#463738] border border-[#A39D98]/40 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors">Consulter Dossier</button>
                                                        <button
                                                            onClick={() => {
                                                                if (typeof window !== 'undefined') {
                                                                     localStorage.setItem(`n2_validated_${u.id_usercount}`, 'true');
                                                                     addNotification(u.id_usercount, "Votre placement 9-Box a été définitivement validé par le comité d'arbitrage N+2.", "success", "/employee");
                                                                     window.location.reload();
                                                                }
                                                            }}
                                                            className="flex-1 bg-[#463738] text-white py-2 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors"
                                                        >
                                                            Valider Placement
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-[#A39D98] italic text-center py-8">Aucune demande d&apos;arbitrage en attente.</p>
                                    )}
                                </div>
                            </div>

                            {/* Statistiques Matrice N+2 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col p-6 animate-in slide-in-from-right-5 duration-300">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E3E1DB]">
                                    <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                        <BarChart3 size={18} className="text-[#9A9750]" /> Synthèse des Talents de votre périmètre
                                    </h3>
                                </div>

                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#A39D98]/30 rounded-xl bg-slate-50 relative group">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/50 backdrop-blur-sm rounded-xl">
                                        <button className="bg-[#9A9750] text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 font-sm hover:bg-[#858245] transition-colors">
                                            <CheckSquare size={18} /> Verrouiller le Périmètre (Clôture N+2)
                                        </button>
                                    </div>

                                    {/* Mini Matrice Mockup */}
                                    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-4 w-full h-[300px] pointer-events-none">
                                        <div className="bg-[#A39D98]/20 rounded-md"></div>
                                        <div className="bg-[#9A9750]/30 rounded-md flex items-center justify-center"><div className="w-6 h-6 bg-black/20 rounded-full text-white text-xs flex items-center justify-center font-bold">2</div></div>
                                        <div className="bg-[#9A9750]/50 rounded-md flex items-center justify-center"><div className="w-8 h-8 bg-black/20 rounded-full text-white text-sm flex items-center justify-center font-bold">5</div></div>

                                        <div className="bg-[#A39D98]/20 rounded-md"></div>
                                        <div className="bg-[#A39D98]/40 rounded-md flex items-center justify-center"><div className="w-10 h-10 bg-black/20 rounded-full text-white text-base flex items-center justify-center font-bold">12</div></div>
                                        <div className="bg-[#9A9750]/30 rounded-md flex items-center justify-center"><div className="w-6 h-6 bg-black/20 rounded-full text-white text-xs flex items-center justify-center font-bold">4</div></div>

                                        <div className="bg-red-100 border border-red-200 rounded-md"></div>
                                        <div className="bg-[#A39D98]/20 rounded-md"></div>
                                        <div className="bg-[#A39D98]/40 rounded-md flex items-center justify-center"><div className="w-6 h-6 bg-black/20 rounded-full text-white text-xs flex items-center justify-center font-bold">3</div></div>
                                    </div>

                                </div>

                                <p className="text-center text-xs text-[#A39D98] mt-4 font-bold uppercase tracking-wider">
                                    Répartition des <span className="text-[#463738]">26 employés</span> validés par N+1
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
