"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell, LogOut, Settings2, ShieldCheck,
    CheckSquare, AlertCircle, FileText, Database, ShieldAlert, BarChart2,
    Map, User, Users, Home, ChevronRight, Globe, Mail, Search, Filter, RefreshCw, Send, Shield, ChevronLeft,
    Plus, Lock, Trash2, Edit3, Save, X, ChevronDown, Check
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
import { GRCReportPreview } from '@/components/mockups/GRCReportPreview';
import { HabilitationModal } from '@/components/mockups/HabilitationModal';
import { useRoleGuard } from '@/hooks/useRoleGuard';

interface Habilitation {
    id: string;
    userId: number;
    userEmail: string;
    userName: string;
    role: 'Administrateur Pays' | 'Admin Site' | 'Auditeur' | 'RH Groupe';
    perimeters: string[]; // ['Cote d'Ivoire', 'Sissengue', 'HQ']
    level: 'read' | 'edit' | 'validate';
    createdAt: string;
}

type ViewMode = 'MY_PROFILE' | 'MY_TEAM' | 'SUPER_ADMIN';

export default function SuperAdminDashboard() {
    useRoleGuard('Employe.12410@company.com');
    const router = useRouter();
    const { currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>('SUPER_ADMIN');
    const [activeTab, setActiveTab] = useState('COMPLIANCE');
    const [showNineBox, setShowNineBox] = useState(false);

    // États pour les actions GRC
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [actionStatus, setActionStatus] = useState<Record<string, { type: 'ID' | 'RELANCE' | 'OVERRIDE', loading: boolean, done: boolean }>>({});
    const [isMounted, setIsMounted] = useState(false);

    // États pour les Habilitations
    const [habilitations, setHabilitations] = useState<Habilitation[]>([]);
    const [showHabilitationModal, setShowHabilitationModal] = useState(false);
    const [editingHabilitation, setEditingHabilitation] = useState<Habilitation | null>(null);

    // Stats calculées côté client pour éviter les erreurs d'hydratation
    const [stats, setStats] = useState({
        complianceRate: 0,
        missingSignatures: 0,
        criticalAlerts: 0,
        completedEvals: 0
    });

    useEffect(() => {
        setIsMounted(true);
        // Calcul des stats depuis le workflow réel (localStorage)
        const totalEmployees = ALL_USERS.filter(u => u.role === 'employe').length;
        const kpiSubmitted = ALL_USERS.filter(u => localStorage.getItem(`kpi_submitted_${u.id_usercount}`) === 'true').length;
        const kpiValidated = ALL_USERS.filter(u => localStorage.getItem(`kpi_validated_${u.id_usercount}`) === 'true').length;
        const selfEvalDone = ALL_USERS.filter(u => localStorage.getItem(`eval_submitted_${u.id_usercount}`) === 'true').length;
        const n1EvalDone = ALL_USERS.filter(u => localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true').length;
        const n2Done = ALL_USERS.filter(u => localStorage.getItem(`n2_validated_${u.id_usercount}`) === 'true').length;

        const progressTotal = kpiSubmitted + kpiValidated + selfEvalDone + n1EvalDone + n2Done;
        const maxProgress = totalEmployees * 5;
        const rate = maxProgress > 0 ? Math.round((progressTotal / maxProgress) * 100) : 0;
        const missing = totalEmployees - kpiSubmitted;
        const critical = ALL_USERS.filter(u => localStorage.getItem(`eval_submitted_${u.id_usercount}`) === 'true' && localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) !== 'true').length;
        const completed = n1EvalDone;

        setStats({
            complianceRate: rate,
            missingSignatures: missing,
            criticalAlerts: critical,
            completedEvals: completed
        });

        // Charger les habilitations
        const savedHab = localStorage.getItem('corica_habilitations');
        if (savedHab) {
            setHabilitations(JSON.parse(savedHab));
        } else {
            // Mock initial data if empty
            const initial: Habilitation[] = [
                { id: '1', userId: 10053, userEmail: 'Employe.10053@company.com', userName: 'Blaise Bonzou Essey', role: 'Administrateur Pays', perimeters: ["Cote d'Ivoire"], level: 'validate', createdAt: '2026-01-10' },
                { id: '2', userId: 10066, userEmail: 'Employe.10066@company.com', userName: 'Francis Nestor Koffi', role: 'Admin Site', perimeters: ['Ity'], level: 'edit', createdAt: '2026-02-15' }
            ];
            setHabilitations(initial);
            localStorage.setItem('corica_habilitations', JSON.stringify(initial));
        }
    }, []);

    const VIEWS: ViewMode[] = ['MY_PROFILE', 'MY_TEAM', 'SUPER_ADMIN'];
    const currentViewIndex = VIEWS.indexOf(viewMode);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1]);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0]);

    // Handler : Générer Rapport GRC
    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        setTimeout(() => {
            setIsGeneratingReport(false);
            setShowReportPreview(true);
        }, 1500);
    };

    // Handler : Envoyer Identifiants
    const handleSendID = async (userId: number, email: string, name: string) => {
        setActionStatus(prev => ({ ...prev, [userId]: { type: 'ID', loading: true, done: false } }));
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: [email],
                    subject: 'Vos accès Corica Talent Quantum',
                    htmlBody: `<p>Bonjour ${name},</p><p>Vos accès sont : Matricule: <b>${email.split('@')[0]}</b>, PIN: <b>1234</b></p>`
                })
            });
            setActionStatus(prev => ({ ...prev, [userId]: { type: 'ID', loading: false, done: true } }));
            setTimeout(() => setActionStatus(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            }), 3000);
        } catch (e) {
            setActionStatus(prev => ({ ...prev, [userId]: { type: 'ID', loading: false, done: false } }));
        }
    };

    // Handler : Relancer
    const handleRelance = async (userId: number, name: string, email: string) => {
        setActionStatus(prev => ({ ...prev, [userId]: { type: 'RELANCE', loading: true, done: false } }));
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: [email],
                    subject: 'Rappel : Évaluation de performance',
                    htmlBody: `<p>Bonjour ${name}, veuillez compléter vos objectifs.</p>`
                })
            });
            setActionStatus(prev => ({ ...prev, [userId]: { type: 'RELANCE', loading: false, done: true } }));
            setTimeout(() => setActionStatus(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            }), 3000);
        } catch (e) {
            setActionStatus(prev => ({ ...prev, [userId]: { type: 'RELANCE', loading: false, done: false } }));
        }
    };

    // Handler : Override
    const handleOverride = (userId: number) => {
        const confirm = window.confirm("ATTENTION : Cette action va forcer l'état de conformité pour cet utilisateur. Continuer ?");
        if (confirm) {
            localStorage.setItem(`pdf_uploaded_${userId}`, 'true');
            localStorage.setItem(`n2_validated_${userId}`, 'true');
            setActionStatus(prev => ({ ...prev, [userId]: { type: 'OVERRIDE', loading: false, done: true } }));
            // Mettre à jour les stats localement avant le reload pour un feedback immédiat
            setStats(prev => ({
                ...prev,
                complianceRate: Math.round((ALL_USERS.filter(u => localStorage.getItem(`pdf_uploaded_${u.id_usercount}`) === 'true').length / ALL_USERS.length) * 100)
            }));
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    // Handlers pour les Habilitations
    const handleSaveHabilitation = (habData: Partial<Habilitation>) => {
        let newHabs;
        if (editingHabilitation) {
            newHabs = habilitations.map(h => h.id === editingHabilitation.id ? { ...h, ...habData } as Habilitation : h);
        } else {
            const newHab: Habilitation = {
                id: Date.now().toString(),
                userId: habData.userId!,
                userEmail: habData.userEmail!,
                userName: habData.userName!,
                role: habData.role!,
                perimeters: habData.perimeters!,
                level: habData.level!,
                createdAt: new Date().toISOString().split('T')[0]
            };
            newHabs = [...habilitations, newHab];
        }
        setHabilitations(newHabs);
        localStorage.setItem('corica_habilitations', JSON.stringify(newHabs));
        setShowHabilitationModal(false);
        setEditingHabilitation(null);
    };

    const handleDeleteHabilitation = (id: string) => {
        if (window.confirm("Supprimer ce rôle d'administrateur ?")) {
            const newHabs = habilitations.filter(h => h.id !== id);
            setHabilitations(newHabs);
            localStorage.setItem('corica_habilitations', JSON.stringify(newHabs));
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden">
            {showNineBox && <NineBoxModal onClose={() => setShowNineBox(false)} />}
            {showReportPreview && <GRCReportPreview onClose={() => setShowReportPreview(false)} />}
            {showHabilitationModal && (
                <HabilitationModal 
                    habilitation={editingHabilitation} 
                    onClose={() => { setShowHabilitationModal(false); setEditingHabilitation(null); }} 
                    onSave={handleSaveHabilitation} 
                />
            )}
            {/* Topbar */}
            <header className="sticky top-0 z-[100] h-[76px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <NavButtons onPrev={handlePrevView} onNext={handleNextView} />
                    <CoricaLogo className="h-10" />
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm flex items-center gap-2">
                        <ShieldAlert size={14} /> Super Administrateur / GRC
                    </span>
                    <DownloadGuideButton />
                    <NotificationBell />
                    <div className="flex items-center gap-2">
                        <UserAvatar nom={currentUser?.nom_prenoms ?? 'Super Admin'} size={34} textClassName="text-xs" />
                        <span className="text-[#463738] font-medium">{currentUser?.nom_prenoms ?? 'Super Admin'} ({currentUser?.departement ?? 'Gouv. & Compliance'})</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors" onClick={() => setViewMode('SUPER_ADMIN')}><Home size={15} className="mb-0.5" /> 🏠 Page d'accueil Super Admin</span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_PROFILE' && 'Mon Profil (Évalué)'}
                        {viewMode === 'MY_TEAM' && 'Mon Équipe Directe'}
                        {viewMode === 'SUPER_ADMIN' && 'Super Administration'}
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
                        onClick={() => setViewMode('SUPER_ADMIN')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'SUPER_ADMIN' ? 'bg-red-600 text-white shadow-md' : 'text-red-700 hover:bg-red-50'}`}
                    >
                        <ShieldAlert size={18} /> Super Administration
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

            {/* Tabs Ribbon (Affiche uniquement en mode SUPER_ADMIN) */}
            {viewMode === 'SUPER_ADMIN' && (
                <div className="bg-[#463738] text-white px-8 py-0 flex items-center shadow-lg relative z-20">
                    <button onClick={() => setActiveTab('COMPLIANCE')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'COMPLIANCE' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                        <span className="flex items-center gap-2"><ShieldCheck size={18} /> Audit & Conformité (Corporative)</span>
                    </button>
                    <button onClick={() => setActiveTab('HABILITATIONS')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'HABILITATIONS' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                        <span className="flex items-center gap-2"><Lock size={18} /> Habilitations & Rôles Admin</span>
                    </button>
                    <button onClick={() => setActiveTab('DATABASE')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'DATABASE' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                        <span className="flex items-center gap-2"><Database size={18} /> Intégrité Système & Data Vault</span>
                    </button>
                    <button onClick={() => setActiveTab('SETTINGS')} className={`py-4 px-6 border-b-4 font-bold text-sm hover:bg-white/5 transition-colors ${activeTab === 'SETTINGS' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98]'}`}>
                        <span className="flex items-center gap-2"><Settings2 size={18} /> Configuration Globale (Super-Admin)</span>
                    </button>
                </div>
            )}

            {/* Main Content Area (OPTIMIZED FOR 1366x768) */}
            <main className="flex-1 w-full max-w-[1280px] lg:w-[95vw] mx-auto py-8 px-6 lg:px-10 overflow-y-auto">
                {viewMode === 'SUPER_ADMIN' && (
                    <>
                        <h2 className="text-[28px] font-bold text-[#463738] mb-1">{currentUser?.fonction ?? 'Group Manager, Governance & Compliance'}</h2>
                        <p className="text-[#A39D98] text-[15px] mb-8">Vue de supervision de la conformité réglementaire (Signatures, RLS, Audit Trail) sur tous les sites du groupe.</p>

                        {activeTab === 'COMPLIANCE' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#A39D98]/30">
                                        <h3 className="text-sm font-bold text-[#A39D98] uppercase">Avancement Global</h3>
                                        <div className="flex items-end gap-3 mt-2">
                                            <span className="text-3xl font-black text-[#463738]">
                                                {isMounted ? stats.complianceRate : 0}%
                                            </span>
                                            <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                                                <div className="bg-[#F26322] h-2 rounded-full transition-all" style={{ width: `${isMounted ? stats.complianceRate : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-[#A39D98] mt-1">Score pondéré 5 étapes workflow</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#A39D98]/30">
                                        <h3 className="text-sm font-bold text-[#A39D98] uppercase">KPIs Non Soumis</h3>
                                        <div className="flex items-end gap-3 mt-2">
                                            <span className="text-3xl font-black text-red-600">
                                                {isMounted ? stats.missingSignatures : 0}
                                            </span>
                                            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 mb-1">En attente</span>
                                        </div>
                                        <p className="text-[10px] text-[#A39D98] mt-1">Employés n&apos;ayant pas soumis leurs objectifs</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#A39D98]/30">
                                        <h3 className="text-sm font-bold text-[#A39D98] uppercase">En attente N+1</h3>
                                        <div className="flex items-end gap-3 mt-2">
                                            <span className="text-3xl font-black text-amber-500">
                                                {isMounted ? stats.criticalAlerts : 0}
                                            </span>
                                            <span className="text-sm font-bold text-[#A39D98] mb-1">Auto-évals soumises</span>
                                        </div>
                                        <p className="text-[10px] text-[#A39D98] mt-1">Auto-évals en attente d&apos;évaluation Manager</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#A39D98]/30">
                                        <h3 className="text-sm font-bold text-[#A39D98] uppercase">Évaluations N+1</h3>
                                        <div className="flex items-end gap-3 mt-2">
                                            <span className="text-3xl font-black text-[#9A9750]">
                                                {isMounted ? stats.completedEvals : 0}
                                            </span>
                                            <span className="text-sm font-bold text-[#A39D98] mb-1">Ce cycle</span>
                                        </div>
                                        <p className="text-[10px] text-[#A39D98] mt-1">Managers ayant soumis leur évaluation</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30">
                                        <h4 className="font-bold text-[#463738] mb-4 flex items-center gap-2">
                                            <Globe size={18} className="text-[#9A9750]" /> Statistiques Multi-sites (Consolidées)
                                        </h4>
                                        <div className="space-y-4">
                                            {isMounted && [
                                                { site: 'Sissengué (CMS S)', key: 'Sissengue' },
                                                { site: 'Ity (CMS I)', key: 'Ity' },
                                                { site: 'Yamoussoukro', key: 'Yamoussoukro' },
                                                { site: 'HQ Corporate', key: 'Abidjan' }
                                            ].map((s, i) => {
                                                const total = ALL_USERS.filter(u => u.pays.toLowerCase().includes(s.key.toLowerCase()) || u.scope?.toLowerCase() === s.key.toLowerCase()).length;
                                                const done = ALL_USERS.filter(u => (u.pays.toLowerCase().includes(s.key.toLowerCase()) || u.scope?.toLowerCase() === s.key.toLowerCase()) && (localStorage.getItem(`kpi_submitted_${u.id_usercount}`) === 'true' || localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true')).length;
                                                const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                                                return (
                                                    <div key={i} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-[#463738]">{s.site}</span>
                                                            <span className="text-[#A39D98]">{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                                            <div className={`h-1.5 rounded-full ${progress > 70 ? 'bg-green-600' : progress > 30 ? 'bg-[#F26322]' : 'bg-red-600'}`} style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {!isMounted && <div className="py-10 text-center text-[10px] text-[#A39D98] font-bold uppercase">Chargement des données sites...</div>}
                                        </div>
                                    </div>
                                    <div className="bg-[#463738] p-6 rounded-2xl shadow-sm border border-white/10 text-white">
                                        <h4 className="font-bold mb-4 flex items-center gap-2">
                                            <ShieldCheck size={18} className="text-[#F26322]" /> Statut de GRC (Gouvernance)
                                        </h4>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                            <span className="text-sm">Audit Externe Prévu</span>
                                            <span className="text-xs font-bold text-[#F26322]">J-14</span>
                                        </div>
                                        <div className="mt-4 p-4 bg-[#F26322]/10 rounded-xl border border-[#F26322]/30">
                                            <p className="text-xs font-medium text-orange-100">Dernière revue de calibration effectuée le 10/03/2026. Prochaine étape : Signature du Group CEO sur le rapport consolidé.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-[#F26322]/30 overflow-hidden">
                                    <div className="p-6 border-b border-[#F26322]/20 bg-orange-50/30 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                                <FileText size={20} className="text-[#F26322]" /> Registre des Évaluations (Log d'Audit Corporatif)
                                            </h3>
                                            <p className="text-sm text-[#A39D98] mt-1">Supervisez et imposez la conformité. Le groupe conserve l'autorité suprême.</p>
                                        </div>

                                        <button 
                                            onClick={handleGenerateReport}
                                            disabled={isGeneratingReport}
                                            className="bg-white border border-[#463738] text-[#463738] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#463738] hover:text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <BarChart2 size={16} className={isGeneratingReport ? "animate-spin" : ""} /> 
                                            {isGeneratingReport ? "Génération..." : "Générer Rapport GRC"}
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                            {isMounted && ALL_USERS.filter(u => u.id_usercount !== 12410).map((user, i) => {
                                                const isConforme = localStorage.getItem(`pdf_uploaded_${user.id_usercount}`) === 'true';
                                                const isN2Done = localStorage.getItem(`n2_validated_${user.id_usercount}`) === 'true';
                                                const isN1Done = localStorage.getItem(`n1_eval_submitted_${user.id_usercount}`) === 'true';
                                                const isSubmitted = localStorage.getItem(`kpi_submitted_${user.id_usercount}`) === 'true';
                                                const isSaved = localStorage.getItem(`kpi_data_${user.id_usercount}`) !== null;

                                                let status = "Non Commencé";
                                                let severity = "high";
                                                if (isConforme) { status = "Conformité Validée"; severity = "low"; }
                                                else if (isN2Done) { status = "Validé N+2 (En attente PDF)"; severity = "low"; }
                                                else if (isN1Done) { status = "Arbitrage N+2 en cours"; severity = "medium"; }
                                                else if (isSubmitted) { status = "Évaluation N+1 en cours"; severity = "medium"; }
                                                else if (isSaved) { status = "Objectifs en brouillon"; severity = "high"; }

                                                const managerN1 = ALL_USERS.find(m => m.id_usercount === user.id_evaluateur);

                                                return (
                                                    <div key={user.id_usercount} className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#E3E1DB]/30 p-4 rounded-xl border border-[#A39D98]/30">
                                                        <div className="flex gap-4 items-center">
                                                            <UserAvatar nom={user.nom_prenoms} size={48} textClassName="text-sm" />
                                                            <div>
                                                                <h4 className="font-bold text-[#463738] text-base">{user.nom_prenoms} <span className="text-xs font-normal text-[#A39D98]">({user.fonction})</span></h4>
                                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                    <span className="text-[10px] font-bold text-white bg-[#463738] px-2 py-0.5 rounded flex items-center gap-1 shadow-sm"><Map size={10} /> {user.pays}</span>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severity === 'high' ? 'text-red-600 bg-red-50 border-red-200' : severity === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200'}`}>{status}</span>
                                                                    <span className="text-[10px] font-medium text-[#A39D98]">Évaluateur : <span className="text-[#463738] font-bold">{managerN1?.nom_prenoms ?? 'N/A'}</span></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                                                            <button 
                                                                onClick={() => handleSendID(user.id_usercount, user.usercount, user.nom_prenoms)}
                                                                className={`flex-1 lg:flex-none px-3 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 border ${actionStatus[user.id_usercount]?.type === 'ID' && actionStatus[user.id_usercount]?.done ? 'bg-green-600 border-green-600 text-white' : 'border-[#A39D98]/40 hover:bg-white'}`}
                                                            >
                                                                <Mail size={14} /> {actionStatus[user.id_usercount]?.type === 'ID' && actionStatus[user.id_usercount]?.loading ? "..." : actionStatus[user.id_usercount]?.type === 'ID' && actionStatus[user.id_usercount]?.done ? "Envoyé" : "ID"}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRelance(user.id_usercount, user.nom_prenoms, user.usercount)}
                                                                className={`flex-1 lg:flex-none px-3 py-2 rounded-lg font-bold text-xs transition-colors border ${actionStatus[user.id_usercount]?.type === 'RELANCE' && actionStatus[user.id_usercount]?.done ? 'bg-orange-600 border-orange-600 text-white' : 'border-[#A39D98]/40 hover:bg-white'}`}
                                                            >
                                                                {actionStatus[user.id_usercount]?.type === 'RELANCE' && actionStatus[user.id_usercount]?.loading ? "..." : actionStatus[user.id_usercount]?.type === 'RELANCE' && actionStatus[user.id_usercount]?.done ? "Relancé" : "Relancer"}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleOverride(user.id_usercount)}
                                                                className="flex-1 lg:flex-none bg-[#463738] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-800 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                                            >
                                                                <ShieldCheck size={14} /> Override
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'HABILITATIONS' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#463738] flex items-center gap-2">
                                            <Lock size={22} className="text-[#F26322]" /> Contrôle des Accès & Habilitations
                                        </h3>
                                        <p className="text-sm text-[#A39D98]">Gérez les administrateurs délégués et leurs périmètres d'intervention par pays.</p>
                                    </div>
                                    <button 
                                        onClick={() => { setEditingHabilitation(null); setShowHabilitationModal(true); }}
                                        className="bg-[#463738] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black shadow-lg transition-all"
                                    >
                                        <Plus size={18} /> Nouveau Rôle Admin
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-[#A39D98] uppercase">Administrateur</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[#A39D98] uppercase">Rôle Attribué</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[#A39D98] uppercase">Périmètre</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[#A39D98] uppercase">Droits</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[#A39D98] uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {habilitations.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-[#A39D98] font-bold">Aucun administrateur délégué pour le moment.</td>
                                                </tr>
                                            ) : habilitations.map((hab) => (
                                                <tr key={hab.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar nom={hab.userName} size={32} />
                                                            <div>
                                                                <p className="font-bold text-[#463738] text-sm">{hab.userName}</p>
                                                                <p className="text-[10px] text-[#A39D98] font-medium">{hab.userEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="bg-[#463738]/5 text-[#463738] px-3 py-1 rounded-full text-[11px] font-bold border border-[#463738]/10 shadow-sm">
                                                            {hab.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {hab.perimeters.map((p, idx) => (
                                                                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                                                                    <Globe size={10} /> {p}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`text-[11px] font-bold flex items-center gap-1 ${hab.level === 'validate' ? 'text-green-600' : hab.level === 'edit' ? 'text-amber-600' : 'text-blue-600'}`}>
                                                            {hab.level === 'validate' ? 'Validation Totale' : hab.level === 'edit' ? 'Édition & RH' : 'Lecture Seule'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => { setEditingHabilitation(hab); setShowHabilitationModal(true); }}
                                                                className="p-2 text-[#A39D98] hover:text-[#463738] hover:bg-gray-100 rounded-lg transition-all"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteHabilitation(hab.id)}
                                                                className="p-2 text-[#A39D98] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'DATABASE' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                            <Database size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-[#A39D98] text-xs font-bold uppercase">Nombre de Dossiers</h3>
                                            <p className="text-[#463738] text-xl font-black">{ALL_USERS.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F26322]/20 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#F26322]/10 text-[#F26322] rounded-xl flex items-center justify-center">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-[#A39D98] text-xs font-bold uppercase">Local Storage Usage</h3>
                                            <p className="text-[#463738] text-xl font-black">
                                                {typeof window !== 'undefined' ? (JSON.stringify(localStorage).length / 1024).toFixed(1) : '0'} KB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#463738]/20 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#463738]/5 text-[#463738] rounded-xl flex items-center justify-center">
                                            <Settings2 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-[#A39D98] text-xs font-bold uppercase">Dernier Sync</h3>
                                            <p className="text-[#463738] text-xl font-black">Instantané (LocalStorage)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                    <div className="bg-[#463738] px-6 py-4 border-b border-white/10">
                                        <h4 className="text-white font-bold flex items-center gap-2"><Database size={18} /> Data Vault & Infrastructure Monitor</h4>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h5 className="font-bold text-[#463738] flex items-center gap-2 border-b border-[#A39D98]/20 pb-2">
                                                    <ShieldCheck size={18} className="text-green-600" /> Infrastructure Integrity
                                                </h5>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Persistence Engine (LocalStorage)', status: 'Operational', color: 'text-green-600' },
                                                        { label: 'RLS Context Isolation', status: 'Operational', color: 'text-green-600' },
                                                        { label: 'Session Integrity', status: 'Active', color: 'text-green-600' },
                                                        { label: 'Notification Ledger', status: 'Synced', color: 'text-green-600' }
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-[#463738]">{item.label}</span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h5 className="font-bold text-[#463738] flex items-center gap-2 border-b border-[#A39D98]/20 pb-2">
                                                    <BarChart2 size={18} className="text-[#F26322]" /> System Distribution
                                                </h5>
                                                <div className="h-40 flex items-end justify-around gap-1 pb-2">
                                                    {isMounted ? [
                                                        { label: 'Saved', count: ALL_USERS.filter(u => localStorage.getItem(`kpi_data_${u.id_usercount}`)).length },
                                                        { label: 'Subm.', count: ALL_USERS.filter(u => localStorage.getItem(`kpi_submitted_${u.id_usercount}`) === 'true').length },
                                                        { label: 'N1', count: ALL_USERS.filter(u => localStorage.getItem(`n1_eval_submitted_${u.id_usercount}`) === 'true').length },
                                                        { label: 'N2', count: ALL_USERS.filter(u => localStorage.getItem(`n2_validated_${u.id_usercount}`) === 'true').length },
                                                        { label: 'PDF', count: ALL_USERS.filter(u => localStorage.getItem(`pdf_uploaded_${u.id_usercount}`) === 'true').length }
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-1 w-full">
                                                            <div className="w-full bg-[#F26322]/20 hover:bg-[#F26322] transition-all rounded-t-sm relative group cursor-help" style={{ height: `${(item.count / ALL_USERS.length) * 100 + 5}%` }}>
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#463738] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                                                    {item.count} / {ALL_USERS.length}
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-[#A39D98] uppercase tracking-tighter">{item.label}</span>
                                                        </div>
                                                    )) : <div className="flex-1 flex items-center justify-center text-[10px] text-[#A39D98] font-bold">CALCUL...</div>}
                                                </div>
                                                <p className="text-center text-[10px] text-[#A39D98] font-bold uppercase tracking-widest">État d'avancement du cycle (Records Count)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'SETTINGS' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <h3 className="text-xl font-bold text-[#463738] mb-6 flex items-center gap-2">
                                    <Settings2 size={24} className="text-[#F26322]" /> Paramètres de Sécurité et Authentification
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                        <div className="bg-[#463738] px-6 py-4 flex items-center justify-between">
                                            <h4 className="text-white font-bold flex items-center gap-2"><ShieldCheck size={18} /> Politique d'Accès</h4>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#463738]">Périodicité de réinitialisation PIN (Kiosque)</label>
                                                <select defaultValue="90" className="mt-1 w-full border border-[#A39D98]/40 rounded-lg px-4 py-3 text-[#463738] font-bold focus:border-[#F26322] outline-none">
                                                    <option value="30">Tous les 30 jours</option>
                                                    <option value="90">Tous les 90 jours (Standard)</option>
                                                    <option value="365">Une fois par an</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-orange-50/30 rounded-lg border border-orange-100">
                                                <div>
                                                    <p className="text-sm font-bold text-[#463738]">MFA Azure AD Obligatoire</p>
                                                    <p className="text-xs text-[#A39D98]">Forcer le 2FA pour les comptes cadres</p>
                                                </div>
                                                <div className="w-12 h-6 bg-[#F26322] rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div>
                                                    <p className="text-sm font-bold text-[#463738]">Session Timeout (Bureau)</p>
                                                    <p className="text-xs text-[#A39D98]">Inactivité avant déconnexion automatique</p>
                                                </div>
                                                <span className="text-sm font-black text-[#463738]">15 min</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                        <div className="bg-[#F26322] px-6 py-4 flex items-center justify-between">
                                            <h4 className="text-white font-bold flex items-center gap-2"><Settings2 size={18} /> Maintenance & Purge</h4>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <button className="w-full bg-white border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-between hover:bg-red-50 transition-colors group">
                                                <div className="text-left">
                                                    <p className="font-bold text-sm">Purger les Sessions Inactives</p>
                                                    <p className="text-xs text-red-400">Libère les verrous de base de données</p>
                                                </div>
                                                <ShieldAlert size={20} className="group-hover:animate-pulse" />
                                            </button>
                                            
                                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <p className="text-sm font-bold text-blue-800">Sauvegarde Hebdomadaire (Vault)</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-blue-600 font-medium">Prochaine : Dimanche 02:00</span>
                                                    <button className="text-[10px] font-black uppercase text-blue-700 hover:underline">Lancer maintenant</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-4">
                                    <button className="px-6 py-3 border border-[#463738] text-[#463738] rounded-xl font-bold hover:bg-gray-100 transition-all">
                                        Annuler
                                    </button>
                                    <button className="bg-[#463738] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                                        Enregistrer la configuration globale
                                    </button>
                                </div>
                            </div>
                        )}

                    </>
                )}

                {viewMode === 'MY_PROFILE' && (
                    <MyProfileMockup />
                )}

                {viewMode === 'MY_TEAM' && (
                    <MyTeamMockup />
                )}
            </main>
        </div>
    );
}
