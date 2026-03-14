"use client";

import React, { useState, useEffect } from 'react';
import {
    LogOut, CheckSquare,
    Users, AlertTriangle, Scale, Home, ChevronRight, User, BarChart2,
    FileText, ThumbsUp, Lock, Unlock, X, Star, MessageSquare, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { MyProfileMockup } from '@/components/mockups/MyProfileMockup';
import { MyTeamMockup } from '@/components/mockups/MyTeamMockup';
import { NineBoxModal } from '@/components/NineBoxModal';
import { useUser, ALL_USERS, CoricaUser } from '@/context/UserContext';
import { UserAvatar } from '@/components/UserAvatar';
import { DownloadGuideButton } from '@/components/DownloadGuideButton';
import { NavButtons } from '@/components/NavButtons';
import { NotificationBell } from '@/components/NotificationBell';
import { printEvaluationForm } from '@/lib/printUtils';
import { useRoleGuard } from '@/hooks/useRoleGuard';

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Faible', color: 'text-red-600 bg-red-50 border-red-200' },
    2: { label: 'Passable', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    3: { label: 'Bon', color: 'text-[#9A9750] bg-[#9A9750]/10 border-[#9A9750]/30' },
    4: { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

export default function ManagerN2Dashboard() {
    useRoleGuard('Employe.10098@company.com');
    const router = useRouter();
    const { currentUser, addNotification } = useUser();
    const [viewMode, setViewMode] = useState<'N2_DASHBOARD' | 'MY_PROFILE' | 'MY_TEAM'>('N2_DASHBOARD');
    const [showNineBox, setShowNineBox] = useState(false);
    const [selectedUser, setSelectedUser] = useState<CoricaUser | null>(null);
    const [dossierScores, setDossierScores] = useState<Record<number, number>>({});
    const [dossierKpis, setDossierKpis] = useState<{ name: string; desc: string; measure?: string; weight?: number }[]>([]);
    const [arbitrageNote, setArbitrageNote] = useState('');
    const [locked, setLocked] = useState(false);

    const n2Subordinates = ALL_USERS.filter(u => u.id_evaluateur_n2 === currentUser?.id_usercount);

    const [pendingN2, setPendingN2] = useState<typeof ALL_USERS>([]);
    const [validatedN2, setValidatedN2] = useState<typeof ALL_USERS>([]);
    const [n1SubmittedCount, setN1SubmittedCount] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pending = n2Subordinates.filter(u =>
                localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true' &&
                localStorage.getItem(`n2_validated_${u.id_usercount}`) !== 'true'
            );
            const validated = n2Subordinates.filter(u =>
                localStorage.getItem(`n2_validated_${u.id_usercount}`) === 'true'
            );
            const n1Count = n2Subordinates.filter(u =>
                localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true'
            ).length;
            setPendingN2(pending);
            setValidatedN2(validated);
            setN1SubmittedCount(n1Count);
            setLocked(localStorage.getItem(`n2_locked_${currentUser?.id_usercount}`) === 'true');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id_usercount]);

    const openDossier = (u: CoricaUser) => {
        setSelectedUser(u);
        try {
            const scores = localStorage.getItem(`n1_eval_scores_${u.id_usercount}`);
            setDossierScores(scores ? JSON.parse(scores) : {});
            const kpis = localStorage.getItem(`kpis_${u.id_usercount}`);
            setDossierKpis(kpis ? JSON.parse(kpis) : []);
        } catch { setDossierScores({}); setDossierKpis([]); }
        setArbitrageNote('');
    };

    const validateN2User = (u: CoricaUser) => {
        localStorage.setItem(`n2_validated_${u.id_usercount}`, 'true');
        addNotification(u.id_usercount, "Votre dossier a été validé par le comité de calibration N+2.", "success", "/employee");
        setSelectedUser(null);
        setPendingN2(prev => prev.filter(x => x.id_usercount !== u.id_usercount));
        setValidatedN2(prev => [...prev, u]);
    };

    const lockPerimeter = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`n2_locked_${currentUser?.id_usercount}`, 'true');
            setLocked(true);
        }
    };

    const printDossier = (u: CoricaUser) => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('eval_period') : null;
        const period = raw ? JSON.parse(raw) : null;
        const manager = ALL_USERS.find(m => m.id_usercount === u.id_evaluateur);
        printEvaluationForm({
            employeeName: u.nom_prenoms,
            employeeId: String(u.id_usercount),
            fonction: (u as any).fonction ?? '—',
            departement: (u as any).departement ?? '—',
            site: u.site,
            pays: u.pays,
            managerN1Name: manager?.nom_prenoms,
            managerN2Name: currentUser?.nom_prenoms,
            kpis: dossierKpis.map(k => ({ name: k.name, desc: k.desc, measure: k.measure, weight: k.weight })),
            evalScores: dossierScores,
            campaignLabel: period?.label,
        }, 'evaluation');
    };

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
                        {/* Dossier modal */}
                        {selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                                    {/* Modal header */}
                                    <div className="bg-[#463738] px-6 py-4 flex items-center justify-between shrink-0">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#A39D98] uppercase tracking-widest mb-0.5">Dossier d&apos;Évaluation N+1</p>
                                            <h3 className="text-white font-bold text-lg leading-tight">{selectedUser.nom_prenoms}</h3>
                                            <p className="text-[#A39D98] text-xs">{(selectedUser as any).fonction ?? '—'} · {selectedUser.site}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => printDossier(selectedUser)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F26322]/20 text-[#F26322] rounded-lg font-bold text-xs hover:bg-[#F26322]/30 transition-colors"
                                            >
                                                <FileText size={14} /> Imprimer
                                            </button>
                                            <button onClick={() => setSelectedUser(null)} className="text-[#A39D98] hover:text-white transition-colors p-1">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Manager N+1 info */}
                                    <div className="px-6 py-3 bg-[#f8f7f4] border-b border-[#E3E1DB] flex items-center gap-3 shrink-0">
                                        <Users size={14} className="text-[#A39D98]" />
                                        <span className="text-xs text-[#A39D98] font-medium">Évalué par N+1 :</span>
                                        <span className="text-xs font-bold text-[#463738]">
                                            {ALL_USERS.find(m => m.id_usercount === selectedUser.id_evaluateur)?.nom_prenoms ?? '—'}
                                        </span>
                                    </div>

                                    {/* KPIs table */}
                                    <div className="flex-1 overflow-y-auto px-6 py-4">
                                        {dossierKpis.length > 0 ? (
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-[#463738] text-white text-xs uppercase tracking-wider">
                                                        <th className="px-3 py-2.5 text-left rounded-tl-lg">Objectif</th>
                                                        <th className="px-3 py-2.5 text-center w-28">Note N+1</th>
                                                        <th className="px-3 py-2.5 text-center w-28 rounded-tr-lg">Résultat</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dossierKpis.map((kpi, i) => {
                                                        const score = dossierScores[i] ?? 0;
                                                        const sl = SCORE_LABELS[score];
                                                        return (
                                                            <tr key={i} className="border-b border-[#E3E1DB] hover:bg-[#fafaf8]">
                                                                <td className="px-3 py-3">
                                                                    <p className="font-bold text-[#463738] text-xs">{kpi.name || `Objectif ${i + 1}`}</p>
                                                                    {kpi.desc && <p className="text-[#A39D98] text-[11px] mt-0.5">{kpi.desc}</p>}
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    <div className="flex justify-center gap-0.5">
                                                                        {[1,2,3,4].map(s => (
                                                                            <Star key={s} size={14} fill={s <= score ? '#F26322' : 'none'} className={s <= score ? 'text-[#F26322]' : 'text-[#ddd]'} />
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    {sl ? (
                                                                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${sl.color}`}>{sl.label}</span>
                                                                    ) : <span className="text-[#A39D98] text-xs">—</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-10 text-[#A39D98] text-sm italic">
                                                Aucun objectif enregistré pour cet employé.
                                            </div>
                                        )}

                                        {/* Arbitrage note */}
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-[#A39D98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <MessageSquare size={12} /> Note d&apos;arbitrage (optionnel)
                                            </label>
                                            <textarea
                                                value={arbitrageNote}
                                                onChange={e => setArbitrageNote(e.target.value)}
                                                rows={2}
                                                placeholder="Commentaire du comité de calibration N+2..."
                                                className="w-full border border-[#E3E1DB] rounded-lg px-3 py-2 text-sm text-[#463738] focus:outline-none focus:border-[#9A9750] resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Modal footer */}
                                    <div className="px-6 py-4 bg-[#f8f7f4] border-t border-[#E3E1DB] flex justify-end gap-3 shrink-0">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="px-4 py-2 border border-[#A39D98]/40 text-[#463738] rounded-lg font-bold text-sm hover:bg-[#E3E1DB] transition-colors"
                                        >
                                            Fermer
                                        </button>
                                        <button
                                            onClick={() => validateN2User(selectedUser)}
                                            className="flex items-center gap-2 px-5 py-2 bg-[#9A9750] text-white rounded-lg font-bold text-sm hover:bg-[#858245] transition-colors shadow-sm"
                                        >
                                            <ThumbsUp size={15} /> Valider le Placement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* KPI counters */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Dans mon périmètre', value: n2Subordinates.length, color: '#463738', icon: <Users size={18} /> },
                                { label: 'Évaluations N+1 soumises', value: n1SubmittedCount, color: '#F26322', icon: <TrendingUp size={18} /> },
                                { label: 'En attente de validation', value: pendingN2.length, color: '#F26322', icon: <AlertTriangle size={18} /> },
                                { label: 'Validés N+2', value: validatedN2.length, color: '#9A9750', icon: <ShieldCheck size={18} /> },
                            ].map((card, i) => (
                                <div key={i} className="bg-white rounded-xl border border-[#A39D98]/30 p-4 flex items-center gap-3 shadow-sm">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${card.color}18`, color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
                                        <p className="text-xs text-[#A39D98] font-medium leading-tight">{card.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Pending arbitrage list */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col p-6">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E3E1DB]">
                                    <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-[#F26322]" /> En attente ({pendingN2.length})
                                    </h3>
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                                    {pendingN2.length > 0 ? pendingN2.map((u, i) => {
                                        const manager = ALL_USERS.find(m => m.id_usercount === u.id_evaluateur);
                                        return (
                                            <div key={i} className="bg-orange-50/60 p-4 rounded-xl border border-orange-200">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className="font-bold text-[#463738] text-sm">{u.nom_prenoms}</span>
                                                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 uppercase">En attente</span>
                                                </div>
                                                <p className="text-xs text-[#A39D98] mb-3">N+1 : {manager?.nom_prenoms || '—'} · {u.site}</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openDossier(u)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 bg-white text-[#463738] border border-[#A39D98]/40 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors"
                                                    >
                                                        <FileText size={13} /> Consulter
                                                    </button>
                                                    <button
                                                        onClick={() => validateN2User(u)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#9A9750] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#858245] transition-colors"
                                                    >
                                                        <ThumbsUp size={13} /> Valider
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <CheckSquare size={36} className="text-[#9A9750] mb-3 opacity-50" />
                                            <p className="text-sm text-[#A39D98] italic">Aucune demande en attente.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Validated + lock panel */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col p-6">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E3E1DB]">
                                    <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-[#9A9750]" /> Validés N+2 ({validatedN2.length})
                                    </h3>
                                    {locked ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#9A9750] bg-[#9A9750]/10 px-3 py-1.5 rounded-full border border-[#9A9750]/30">
                                            <Lock size={12} /> Périmètre clôturé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={lockPerimeter}
                                            disabled={pendingN2.length > 0}
                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#463738] text-white hover:bg-gray-800 border-transparent"
                                            title={pendingN2.length > 0 ? 'Validez tous les dossiers avant de clôturer' : ''}
                                        >
                                            <Unlock size={12} /> Clôturer le Périmètre
                                        </button>
                                    )}
                                </div>

                                {locked && (
                                    <div className="flex items-center gap-2 bg-[#9A9750]/10 border border-[#9A9750]/30 rounded-xl px-4 py-3 mb-4 text-sm text-[#9A9750] font-medium">
                                        <ShieldCheck size={16} /> Calibration clôturée — aucune modification possible.
                                    </div>
                                )}

                                <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1">
                                    {validatedN2.length > 0 ? validatedN2.map((u, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#9A9750]/8 border border-[#9A9750]/20 hover:bg-[#9A9750]/12 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-[#9A9750]/20 flex items-center justify-center shrink-0">
                                                    <ShieldCheck size={13} className="text-[#9A9750]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#463738]">{u.nom_prenoms}</p>
                                                    <p className="text-[10px] text-[#A39D98]">{u.site}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-[#9A9750] uppercase tracking-wide">Validé</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-[#A39D98] italic text-center py-8">
                                            Aucun dossier validé pour l&apos;instant.
                                        </p>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 pt-4 border-t border-[#E3E1DB]">
                                    <div className="flex justify-between text-xs font-bold text-[#A39D98] mb-1.5">
                                        <span>Progression calibration</span>
                                        <span>{n2Subordinates.length > 0 ? Math.round((validatedN2.length / n2Subordinates.length) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 bg-[#E3E1DB] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#9A9750] rounded-full transition-all duration-500"
                                            style={{ width: `${n2Subordinates.length > 0 ? (validatedN2.length / n2Subordinates.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#A39D98] mt-1">{validatedN2.length} / {n2Subordinates.length} dossiers traités</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
