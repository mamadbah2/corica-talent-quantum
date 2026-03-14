"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell, LogOut, Settings2, ShieldCheck,
    Globe, LayoutDashboard, BarChart4, Filter, Map, BarChart2,
    CheckSquare, AlertCircle, User, Users, Home, ChevronRight,
    Presentation, Building2, Calendar, Save, CheckCircle, Clock, Lock, Unlock
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

type ViewMode = 'MY_PROFILE' | 'MY_TEAM' | 'GROUP_ADMIN' | 'RAPPORT_CONSOLIDE';

export default function GroupAdminDashboard() {
    const router = useRouter();
    const { currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>('GROUP_ADMIN');
    const [activeTab, setActiveTab] = useState('ANALYTICS');
    const [showNineBox, setShowNineBox] = useState(false);

    // ─── États ajoutés pour les boutons Admin ─────────────────────────────────
    const [filterPays, setFilterPays] = useState<string | null>(null);
    const [showPaysDropdown, setShowPaysDropdown] = useState(false);
    const [filterSite, setFilterSite] = useState<string | null>(null);
    const [showSiteDropdown, setShowSiteDropdown] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
    const [audits, setAudits] = useState([
        { id: 1, emp: 'Kader Sylla', role: 'Directeur Opex', site: "Côte d'Ivoire", manager: 'DG Filiale', status: 'En attente Validation Alternative' },
        { id: 2, emp: 'Oumar Diallo', role: 'Executive VP', site: 'HQ Corporate', manager: 'Group CEO', status: 'En attente Validation HQ' }
    ]);

    const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // ─── Paramètres période auto-évaluation ───────────────────────────────────
    const [periodLabel, setPeriodLabel] = useState('Campagne Évaluation 2026');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [periodSaved, setPeriodSaved] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('eval_period');
        if (raw) {
            const p = JSON.parse(raw);
            setPeriodLabel(p.label || 'Campagne Évaluation 2026');
            setPeriodStart(p.startDate || '');
            setPeriodEnd(p.endDate || '');
        }
    }, []);

    const handleSavePeriod = () => {
        const period = { label: periodLabel, startDate: periodStart, endDate: periodEnd };
        localStorage.setItem('eval_period', JSON.stringify(period));
        setPeriodSaved(true);
        setTimeout(() => setPeriodSaved(false), 3000);
    };

    const periodStatus = () => {
        if (!periodStart || !periodEnd) return { label: 'Non configurée', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', Icon: Lock };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        if (today < start) return { label: `S'ouvre le ${start.toLocaleDateString('fr-FR')}`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', Icon: Clock };
        if (today > end) return { label: 'Clôturée', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', Icon: Lock };
        return { label: 'En cours ✓', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: Unlock };
    };

    const VIEWS: ViewMode[] = ['MY_PROFILE', 'MY_TEAM', 'GROUP_ADMIN', 'RAPPORT_CONSOLIDE'];
    const currentViewIndex = VIEWS.indexOf(viewMode);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1]);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0]);

    // ─── Vue : Rapport Consolidé de Pilotage (Groupe) ─────────────────────────
    const renderRapportConsolide = () => {
        const statsPays = [
            {
                pays: "Côte d'Ivoire", effectif: 540, evalues: 499, pourcentage: 92,
                sites: [
                    { nom: "Bureau d'Abidjan", effectif: 120, evalues: 110, dec: 91 },
                    { nom: 'Ity', effectif: 180, evalues: 170, dec: 94 },
                    { nom: 'Sissengué', effectif: 90, evalues: 85, dec: 94 },
                    { nom: 'Tongon', effectif: 150, evalues: 134, dec: 89 },
                    { nom: 'Yamoussoukro', effectif: 60, evalues: 0, dec: 0 }
                ]
            },
            {
                pays: "Mali", effectif: 400, evalues: 320, pourcentage: 80,
                sites: [
                    { nom: 'Bureau de Bamako', effectif: 60, evalues: 58, dec: 96 },
                    { nom: 'Baboto', effectif: 40, evalues: 38, dec: 95 },
                    { nom: 'Goulamina', effectif: 80, evalues: 60, dec: 75 },
                    { nom: 'Gounkoto', effectif: 90, evalues: 80, dec: 88 },
                    { nom: 'Kobada', effectif: 30, evalues: 30, dec: 100 },
                    { nom: 'Kayes', effectif: 20, evalues: 18, dec: 90 },
                    { nom: 'Sadiola', effectif: 70, evalues: 65, dec: 92 },
                    { nom: 'Syama', effectif: 120, evalues: 110, dec: 91 }
                ]
            },
            {
                pays: "Sénégal", effectif: 310, evalues: 310, pourcentage: 100,
                sites: [
                    { nom: 'Mine de Sabodala', effectif: 250, evalues: 250, dec: 100 },
                    { nom: 'HQ Dakar', effectif: 60, evalues: 60, dec: 100 }
                ]
            }
        ];

        const effectifTotalGroupe = statsPays.reduce((acc, p) => acc + p.effectif, 0);
        const effectifEvalueGroupe = statsPays.reduce((acc, p) => acc + p.evalues, 0);
        const ratioGlobal = Math.round((effectifEvalueGroupe / effectifTotalGroupe) * 100) || 0;

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30">
                    <div>
                        <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-3">
                            <Presentation className="text-[#9A9750]" size={28} /> Rapport Consolidé de Pilotage (Global)
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">
                            Vue exhaustive de la campagne annuelle d'évaluation, consolidée pour toutes les filiales, pays et sites du Groupe.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* KPI Glogal */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F26322]/30 flex flex-col justify-center items-center text-center col-span-1 min-h-[250px]">
                        <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide mb-4">Ratio Global Évalué</h3>

                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="#F26322" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ratioGlobal) / 100} />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-[#463738]">{ratioGlobal}%</span>
                            </div>
                        </div>
                        <p className="mt-4 font-bold text-[#463738] text-sm">{effectifEvalueGroupe} / {effectifTotalGroupe} collaborateurs</p>
                    </div>

                    {/* Breakdown par pays */}
                    <div className="col-span-1 md:col-span-3 bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#A39D98]/20 bg-[#f9f9f9]">
                            <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                <Globe size={20} className="text-[#9A9750]" /> Effectif & Pourcentage d'Évaluation par Pays
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {statsPays.map((pays, p_index) => (
                                    <div key={p_index} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-[#463738] text-base flex items-center gap-2">
                                                <Map size={18} className="text-[#F26322]" /> {pays.pays}
                                            </span>
                                            <div className="flex items-center gap-4 text-[#A39D98]">
                                                <span>{pays.evalues} / {pays.effectif} évalués</span>
                                                <span className={`px-2.5 py-1 rounded text-xs text-white shadow-sm ${pays.pourcentage === 100 ? 'bg-emerald-600' : pays.pourcentage > 80 ? 'bg-[#9A9750]' : 'bg-red-600'}`}>
                                                    {pays.pourcentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#E3E1DB] h-2.5 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-1000 ${pays.pourcentage === 100 ? 'bg-emerald-600' : pays.pourcentage > 80 ? 'bg-[#9A9750]' : 'bg-red-600'}`}
                                                style={{ width: `${pays.pourcentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                        <p className="text-[10px] text-[#A39D98] font-bold tracking-widest uppercase">Group Administration</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-[#463738] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">Admin Group (HR Manager RTD)</span>
                    <DownloadGuideButton />
                    <Bell size={20} className="text-[#A39D98] cursor-pointer hover:text-[#F26322] transition-colors mx-2" />
                    <div className="flex items-center gap-2">
                        <UserAvatar nom={currentUser?.nom_prenoms ?? 'Group Admin'} size={34} textClassName="text-xs" />
                        <span className="text-[#463738] font-medium">{currentUser?.nom_prenoms ?? 'Bamba Abdoulaye'} (Corporate HQ)</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* Scope Identifier Banner */}
            <div className="bg-[#E3E1DB]/60 border-b border-[#A39D98]/30 px-8 py-3 flex justify-between items-center text-[14px]">
                <div className="flex items-center gap-3 text-[#463738]">
                    <Globe className="text-[#463738]" size={18} />
                    <span className="font-bold tracking-wide">Périmètre Global (Corporate) :</span>
                    <span className="bg-white px-3 py-1 rounded font-bold text-sm border border-[#A39D98]/30 shadow-sm text-[#463738]">Totalité du Groupe</span>
                </div>
            </div>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors"><Home size={15} className="mb-0.5" /> 🏠 Page d'accueil Group Admin</span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_PROFILE' && 'Mon Profil (Évalué)'}
                        {viewMode === 'MY_TEAM' && 'Mon Équipe Directe'}
                        {viewMode === 'GROUP_ADMIN' && 'Supervision Globale'}
                        {viewMode === 'RAPPORT_CONSOLIDE' && 'Rapport Consolidé'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-bold text-[#A39D98] mr-2">Espace :</span>
                    <button
                        onClick={() => setViewMode('MY_PROFILE')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_PROFILE' ? 'bg-[#9A9750] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <User size={18} /> Mon Profil (Évalué)
                    </button>
                    <button
                        onClick={() => setViewMode('MY_TEAM')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_TEAM' ? 'bg-[#463738] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Users size={18} /> Mon Équipe Directe
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setViewMode('GROUP_ADMIN')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'GROUP_ADMIN' ? 'bg-[#F26322] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Globe size={18} /> Supervision Globale
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

            {/* Tabs / Filters Ribbon */}
            <div className="bg-[#463738] text-white px-8 py-0 flex items-center shadow-lg relative z-20">
                <button onClick={() => setActiveTab('ANALYTICS')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'ANALYTICS' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                    <span className="flex items-center gap-2"><BarChart4 size={18} /> Consolidé Groupe</span>
                </button>
                <button onClick={() => setActiveTab('CAMPAIGNS')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'CAMPAIGNS' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                    <span className="flex items-center gap-2"><Globe size={18} /> Pilotage Campagnes</span>
                </button>
                <button onClick={() => setActiveTab('COMPLIANCE')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'COMPLIANCE' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                    <span className="flex items-center gap-2"><ShieldCheck size={18} /> Validation HR (Fallback)</span>
                </button>
                <button onClick={() => setActiveTab('SETTINGS')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'SETTINGS' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                    <span className="flex items-center gap-2"><Settings2 size={18} /> Paramètres Globaux</span>
                </button>

                <div className="ml-auto flex items-center gap-3 relative">
                    <div className="relative">
                        <button onClick={() => setShowPaysDropdown(!showPaysDropdown)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded transition-colors ${filterPays ? 'bg-[#F26322] text-white' : 'text-[#463738] bg-[#E3E1DB] hover:bg-white'}`}>
                            <Filter size={14} /> {filterPays ? `Pays: ${filterPays}` : 'Filtre Pays'}
                        </button>
                        {showPaysDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#A39D98]/30 rounded-lg shadow-xl z-50 py-1">
                                {['Toutes régions', 'Côte d\'Ivoire', 'Sénégal', 'Mali', 'Guinée'].map(p => (
                                    <button key={p} onClick={() => { setFilterPays(p === 'Toutes régions' ? null : p); setShowPaysDropdown(false); showToast(`Filtre pays appliqué : ${p}`, 'success'); }} className="w-full text-left px-4 py-2 text-sm text-[#463738] hover:bg-orange-50 hover:text-[#F26322]">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowSiteDropdown(!showSiteDropdown)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded transition-colors ${filterSite ? 'bg-[#9A9750] text-white' : 'text-[#463738] bg-[#E3E1DB] hover:bg-white'}`}>
                            <Map size={14} /> {filterSite ? `Site: ${filterSite}` : 'Filtre Site'}
                        </button>
                        {showSiteDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#A39D98]/30 rounded-lg shadow-xl z-50 py-1">
                                {['Tous les sites', "Bureau d'Abidjan", 'Ity', 'Sissengué', 'Tongon', 'Yamoussoukro', 'Bureau de Bamako', 'Baboto', 'Goulamina', 'Gounkoto', 'Kobada', 'Kayes', 'Sadiola', 'Syama', 'Sabodala'].map(s => (
                                    <button key={s} onClick={() => { setFilterSite(s === 'Tous les sites' ? null : s); setShowSiteDropdown(false); showToast(`Filtre site appliqué : ${s}`, 'success'); }} className="w-full text-left px-4 py-2 text-sm text-[#463738] hover:bg-orange-50 hover:text-[#F26322]">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1400px] mx-auto w-full">
                {viewMode === 'GROUP_ADMIN' && (
                    <>
                        <h2 className="text-[28px] font-bold text-[#463738] mb-1">Direction du Capital Humain (HQ)</h2>
                        <p className="text-[#A39D98] text-[15px] mb-8">Vue désilotée (Multi-tenant) : Performances globales et Paramétrage du Core RH.</p>

                        {/* Actions principales */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 p-6 mb-8">
                            <h3 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                <User size={18} className="text-[#F26322]" /> Actions principales (Reporting)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Rapport consolidé */}
                                <button
                                    onClick={() => setViewMode('RAPPORT_CONSOLIDE')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all col-span-1 lg:col-span-2"
                                    style={{ background: 'linear-gradient(135deg, #F26322 0%, #463738 100%)' }}
                                >
                                    <Presentation size={22} /> Rapport consolidé de pilotage
                                </button>
                                {/* Validation Globale */}
                                <button
                                    onClick={() => setActiveTab('COMPLIANCE')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #9A9750 0%, #463738 100%)' }}
                                >
                                    <ShieldCheck size={22} /> Conformité HQ
                                </button>
                                {/* Paramètres */}
                                <button
                                    onClick={() => setActiveTab('SETTINGS')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #463738 0%, #F26322 100%)' }}
                                >
                                    <Settings2 size={22} /> Configuration
                                </button>
                            </div>
                        </div>

                        {activeTab === 'ANALYTICS' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">

                                {/* Bandeau statut campagne */}
                                {(() => {
                                    const status = periodStatus();
                                    const StatusIcon = status.Icon;
                                    return (
                                        <div className={`col-span-full flex items-center justify-between px-5 py-3 rounded-xl border ${status.bg} ${status.border}`}>
                                            <div className="flex items-center gap-3">
                                                <StatusIcon size={18} className={status.color} />
                                                <div>
                                                    <span className={`text-sm font-black ${status.color}`}>{periodLabel || 'Campagne non configurée'}</span>
                                                    {periodStart && periodEnd && (
                                                        <span className={`ml-3 text-xs font-semibold ${status.color} opacity-80`}>
                                                            {new Date(periodStart).toLocaleDateString('fr-FR')} → {new Date(periodEnd).toLocaleDateString('fr-FR')} · {status.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('SETTINGS')}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-current opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                                <Calendar size={13} /> Configurer
                                            </button>
                                        </div>
                                    );
                                })()}

                                {/* Key Metrics */}
                                {[
                                    { title: "Filiales actives", val: "6", c: "text-[#463738]" },
                                    { title: "Employés Sous Contrat", val: "2,450", c: "text-[#F26322]" },
                                    { title: "Avancement Campagne '26", val: "42%", c: "text-[#9A9750]" },
                                    { title: "Hauts Potentiels (HIPO)", val: "118", c: "text-emerald-600" }
                                ].map((met, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 p-6 flex items-center justify-between hover:border-[#F26322]/50 transition-colors">
                                        <div>
                                            <h3 className="text-xs font-bold text-[#A39D98] uppercase tracking-wider mb-2">{met.title}</h3>
                                            <span className={`text-4xl font-black ${met.c}`}>{met.val}</span>
                                        </div>
                                        <div className="w-12 h-12 bg-[#E3E1DB]/50 rounded-full flex items-center justify-center">
                                            <ShieldCheck size={24} className="text-[#A39D98]" />
                                        </div>
                                    </div>
                                ))}

                                {/* Consolidated 9-Box Panel (Placeholder concept) */}
                                <div className="col-span-full md:col-span-3 bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden flex flex-col min-h-[400px]">
                                    <div className="px-6 py-4 border-b border-[#E3E1DB] bg-slate-50 flex items-center justify-between">
                                        <h3 className="font-bold text-[#463738] text-lg flex items-center gap-2"><LayoutDashboard size={20} className="text-[#F26322]" /> Matrice 9-Box Consolidée (Corporate View)</h3>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#F4F6F9]">
                                        <div className="max-w-md text-center">
                                            <BarChart4 size={48} className="mx-auto text-[#A39D98] mb-4 opacity-50" />
                                            <h4 className="text-[#463738] font-bold text-xl mb-2">Agrégation en temps réel</h4>
                                            <p className="text-[#A39D98] text-sm">Les données de tous les sites (Burkina Faso, Côte d'Ivoire, siège) remonteront ici après clôture par les administrateurs locaux.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Focus Action/Alert */}
                                <div className="col-span-full md:col-span-1 bg-white rounded-2xl shadow-sm border border-[#F26322]/30 flex flex-col overflow-hidden">
                                    <div className="bg-[#F26322] px-6 py-4">
                                        <h3 className="font-bold text-white">Alertes & Audits</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="text-sm border-l-4 border-red-500 pl-3">
                                            <span className="font-bold text-[#463738] block">Site ABIDJAN HQ</span>
                                            <span className="text-[#A39D98]">14 cadres n'ont pas validé leurs KPIs (Retard de 2 jours).</span>
                                        </div>
                                        <div className="text-sm border-l-4 border-amber-500 pl-3">
                                            <span className="font-bold text-[#463738] block">Site OUA-MINE-2</span>
                                            <span className="text-[#A39D98]">Arbitrage bloqué au niveau N+2.</span>
                                        </div>
                                        <button onClick={() => showToast("Rapport d'exception généré et téléchargé avec succès.", 'success')} className="w-full mt-6 bg-[#463738] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-gray-800 transition-colors uppercase tracking-widest shadow-md active:scale-95">
                                            Générer Rapport d'Exception
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'COMPLIANCE' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-[#F26322]/30 overflow-hidden">
                                    <div className="p-6 border-b border-[#F26322]/20 bg-orange-50/30">
                                        <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                            <CheckSquare size={20} className="text-[#F26322]" /> Validation HR Groupe (À défaut du local)
                                        </h3>
                                        <p className="text-sm text-[#A39D98] mt-1">En tant que Group HR Manager RTD, vous pouvez valider le processus ou demander une révision aux managers à la place ou en l'absence de Coordination Locale.</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {audits.length === 0 ? (
                                                <div className="text-center py-8 text-[#A39D98]">Aucune validation en attente. Processus à jour !</div>
                                            ) : (
                                                audits.map((audit) => (
                                                    <div key={audit.id} className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#E3E1DB]/30 p-4 rounded-xl border border-[#A39D98]/30">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="w-12 h-12 rounded-full bg-[#463738] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                                {audit.emp.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-[#463738] text-lg">{audit.emp} <span className="text-sm font-normal text-[#A39D98]">({audit.role})</span></h4>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-xs font-bold text-white bg-[#463738] px-2 py-0.5 rounded flex items-center gap-1 shadow-sm"><Map size={12} /> {audit.site}</span>
                                                                    <span className="text-xs font-bold text-[#F26322] bg-[#F26322]/10 px-2 py-0.5 rounded border border-[#F26322]/20">{audit.status}</span>
                                                                    <span className="text-xs font-medium text-[#A39D98]">Évalué par : <span className="text-[#463738] font-bold">{audit.manager}</span></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                                            <button onClick={() => {
                                                                setAudits(audits.filter(a => a.id !== audit.id));
                                                                showToast(`Demande de révision envoyée à ${audit.manager}.`, 'warning');
                                                            }} className="flex-1 lg:flex-none bg-white text-red-600 border border-red-200 px-5 py-3 rounded-lg font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                                                <AlertCircle size={16} /> Demander Révision au Manager
                                                            </button>
                                                            <button onClick={() => {
                                                                setAudits(audits.filter(a => a.id !== audit.id));
                                                                showToast(`Processus validé avec succès pour ${audit.emp}.`, 'success');
                                                            }} className="flex-1 lg:flex-none bg-[#9A9750] text-white px-5 py-3 rounded-lg font-bold text-sm hover:bg-[#858245] shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95">
                                                                <ShieldCheck size={16} /> Valider le Processus
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'SETTINGS' && (() => {
                            const status = periodStatus();
                            const StatusIcon = status.Icon;
                            return (
                                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                                    <div className="bg-white rounded-2xl shadow-sm border border-[#463738]/20 overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-[#463738] px-6 py-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-black text-white text-lg flex items-center gap-2">
                                                    <Calendar size={20} /> Paramétrage de la Campagne d'Évaluation
                                                </h3>
                                                <p className="text-white/60 text-xs mt-1">Configurez les dates de la fenêtre d'auto-évaluation pour tous les employés du Groupe.</p>
                                            </div>
                                            {/* Statut live */}
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bg} ${status.border}`}>
                                                <StatusIcon size={16} className={status.color} />
                                                <span className={`text-sm font-black ${status.color}`}>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Formulaire */}
                                        <div className="p-8 space-y-6">
                                            {/* Nom de la campagne */}
                                            <div>
                                                <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-2">Nom de la campagne</label>
                                                <input
                                                    value={periodLabel}
                                                    onChange={e => setPeriodLabel(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E1DB] text-[15px] font-semibold text-[#463738] outline-none focus:border-[#F26322] bg-[#f8f7f5] focus:bg-white transition-all"
                                                    placeholder="Ex : Campagne Évaluation 2026"
                                                />
                                            </div>

                                            {/* Dates */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-2">Date d'ouverture des auto-évaluations</label>
                                                    <input
                                                        type="date"
                                                        value={periodStart}
                                                        onChange={e => setPeriodStart(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-[#E3E1DB] text-[14px] text-[#463738] outline-none focus:border-[#9A9750] bg-[#f8f7f5] focus:bg-white transition-all"
                                                    />
                                                    <p className="text-[11px] text-[#A39D98] mt-1">À partir de cette date, les employés peuvent s'auto-évaluer.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-2">Date de clôture des auto-évaluations</label>
                                                    <input
                                                        type="date"
                                                        value={periodEnd}
                                                        onChange={e => setPeriodEnd(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-[#E3E1DB] text-[14px] text-[#463738] outline-none focus:border-[#F26322] bg-[#f8f7f5] focus:bg-white transition-all"
                                                    />
                                                    <p className="text-[11px] text-[#A39D98] mt-1">Après cette date, les auto-évaluations seront verrouillées.</p>
                                                </div>
                                            </div>

                                            {/* Résumé de la période */}
                                            {periodStart && periodEnd && (
                                                <div className={`rounded-xl border p-4 flex items-start gap-3 ${status.bg} ${status.border}`}>
                                                    <StatusIcon size={20} className={`${status.color} shrink-0 mt-0.5`} />
                                                    <div>
                                                        <p className={`font-black text-sm ${status.color}`}>{periodLabel}</p>
                                                        <p className="text-[#463738] text-sm mt-1">
                                                            Du <strong>{new Date(periodStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> au <strong>{new Date(periodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                                        </p>
                                                        <p className={`text-xs mt-0.5 font-bold ${status.color}`}>Statut : {status.label}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bouton enregistrer */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={handleSavePeriod}
                                                    disabled={!periodStart || !periodEnd}
                                                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[15px] transition-all shadow-lg ${!periodStart || !periodEnd
                                                        ? 'bg-[#E3E1DB] text-[#A39D98] cursor-not-allowed'
                                                        : 'bg-[#F26322] text-white hover:bg-orange-600 hover:scale-105'
                                                        }`}
                                                >
                                                    {periodSaved
                                                        ? <><CheckCircle size={18} /> Enregistré !</>
                                                        : <><Save size={18} /> Enregistrer et Activer la Période</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info bloc */}
                                    <div className="bg-[#463738]/5 border border-[#463738]/20 rounded-xl p-5">
                                        <h4 className="font-black text-[#463738] text-sm mb-3 flex items-center gap-2"><Settings2 size={16} /> Règles métier appliquées automatiquement</h4>
                                        <ul className="space-y-2 text-sm text-[#463738]">
                                            <li className="flex items-start gap-2"><CheckCircle size={14} className="text-[#9A9750] shrink-0 mt-0.5" /> Un employé ne peut s'auto-évaluer <strong>qu'après validation de ses objectifs par son N+1</strong>.</li>
                                            <li className="flex items-start gap-2"><CheckCircle size={14} className="text-[#9A9750] shrink-0 mt-0.5" /> L'accès à l'auto-évaluation est <strong>automatiquement verrouillé</strong> hors période.</li>
                                            <li className="flex items-start gap-2"><CheckCircle size={14} className="text-[#9A9750] shrink-0 mt-0.5" /> La configuration s'applique <strong>à tous les employés du Groupe</strong> instantanément.</li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        })()}

                    </>
                )}

                {viewMode === 'MY_PROFILE' && (
                    <MyProfileMockup />
                )}

                {viewMode === 'MY_TEAM' && (
                    <MyTeamMockup />
                )}

                {viewMode === 'RAPPORT_CONSOLIDE' && renderRapportConsolide()}
            </main>
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 border ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    toastMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {toastMessage.type === 'success' && <CheckSquare size={20} className="text-emerald-500" />}
                    {toastMessage.type === 'warning' && <AlertCircle size={20} className="text-amber-500" />}
                    {toastMessage.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
                    <span className="font-bold text-[14px]">{toastMessage.message}</span>
                </div>
            )}
        </div>
    );
}
