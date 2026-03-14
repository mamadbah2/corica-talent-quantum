"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell, LogOut, FilePlus, Target,
    CheckCircle, FileText, Download, ShieldAlert, CheckSquare,
    Star, RefreshCw, PenTool, Lock, User, TrendingUp, LayoutDashboard, MessageSquare, Trash2, Plus,
    History, Home, X, UploadCloud, ClipboardList, Calendar, Clock, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useUser } from '@/context/UserContext';

type EmployeeGrade = 'MANAGER' | 'NON_CADRE';
type KpiStatus = 'DRAFT' | 'N1_PROPOSED' | 'MODIFIED_BY_EMP' | 'VALIDATED';
type EmployeeView = 'PROFILE' | 'OBJECTIVES' | 'EVALUATION' | 'DASHBOARD';

export function MyProfileMockup() {
    const router = useRouter();
    const { currentUser, managerN1, managerN2, userPhotoUrl, setUserPhotoUrl } = useUser();
    const [grade, setGrade] = useState<EmployeeGrade>('NON_CADRE');
    const [photoSaveMsg, setPhotoSaveMsg] = useState<string | null>(null);

    // États locaux pour les champs éditables (pour éviter l'effet "figé")
    const [localName, setLocalName] = useState('');
    const [localPhone, setLocalPhone] = useState('');
    const [localHireDate, setLocalHireDate] = useState('');
    const [localBirthDate, setLocalBirthDate] = useState('Non définie');

    // Synchronisation initiale
    useEffect(() => {
        if (currentUser) {
            setLocalName(currentUser.nom_prenoms || '');
            setLocalPhone(currentUser.telephone || '');
            setLocalHireDate(currentUser.date_embauche || 'Non définie');
        }
    }, [currentUser]);

    // Gestion upload photo
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('La photo ne doit pas d\'uploite pas 5 Mo.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setUserPhotoUrl(base64);
            setPhotoSaveMsg('Photo enregistrée avec succès !');
            setTimeout(() => setPhotoSaveMsg(null), 3000);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setUserPhotoUrl(null);
        setPhotoSaveMsg('Photo supprimée.');
        setTimeout(() => setPhotoSaveMsg(null), 2500);
    };

    // Pour les Employés Non-Cadres
    const [ncKpis, setNcKpis] = useState<{ id: number; desc: string; measure?: string; weight: number; status: KpiStatus }[]>([
        { id: 1, desc: 'Atteindre 95% de disponibilité sur la flotte de camions', measure: '', weight: 60, status: 'N1_PROPOSED' as KpiStatus },
        { id: 2, desc: 'Zéro incident LTI sur le trimestre', measure: '', weight: 40, status: 'N1_PROPOSED' as KpiStatus }
    ]);

    // Pour les Managers
    const [mgrKpis, setMgrKpis] = useState<{
        performance: { id: number; desc: string; measure?: string; weight: number; status: KpiStatus }[];
        leadership: { id: number; desc: string; measure?: string; status: KpiStatus }[];
    }>({
        performance: [
            { id: 1, desc: 'Safety: Zéro accident majeur', measure: '', weight: 30, status: 'N1_PROPOSED' as KpiStatus },
            { id: 2, desc: 'Costs Saving: Réduction Opex de 5%', measure: '', weight: 40, status: 'N1_PROPOSED' as KpiStatus },
            { id: 3, desc: 'Core Business: Production or 100k oz', measure: '', weight: 30, status: 'N1_PROPOSED' as KpiStatus }
        ],
        leadership: [
            { id: 4, desc: 'Operational Excellence', measure: '', status: 'N1_PROPOSED' as KpiStatus },
            { id: 5, desc: 'Teamwork & Innovation', measure: '', status: 'N1_PROPOSED' as KpiStatus }
        ]
    });

    const [workflowStep, setWorkflowStep] = useState<'CO_CONSTRUCTION' | 'WAITING_N1' | 'EVALUATION'>('CO_CONSTRUCTION');

    useEffect(() => {
        if (currentUser && typeof window !== 'undefined') {
            const storedKpisStr = localStorage.getItem(`kpi_data_${currentUser.id_usercount}`);
            const isKpiValidated = localStorage.getItem(`kpi_validated_${currentUser.id_usercount}`) === 'true';

            if (storedKpisStr) {
                try {
                    const storedKpis = JSON.parse(storedKpisStr);
                    const formatted = storedKpis.map((k: any) => ({
                        id: k.id,
                        desc: k.desc || k.name,
                        measure: k.measure || '',
                        weight: k.weight || 0,
                        status: isKpiValidated ? 'VALIDATED' : 'WAITING_N1'
                    }));
                    setNcKpis(formatted);
                    setMgrKpis(prev => ({ ...prev, performance: formatted }));
                    setObjectiveDrafts(storedKpis);
                    if (isKpiValidated) setWorkflowStep('EVALUATION');
                    else setWorkflowStep('WAITING_N1');
                } catch (e) {
                    console.error('Failed to parse kpis', e);
                }
            }
        }
    }, [currentUser]);

    const [evalScores, setEvalScores] = useState<Record<number, number>>({});
    const [evalComments, setEvalComments] = useState<Record<number, string>>({});
    const [evalFiles, setEvalFiles] = useState<Record<number, File | null>>({});
    const [objectiveDrafts, setObjectiveDrafts] = useState([
        { id: 1, name: 'Ex: Améliorer la productivité', desc: '', measure: '', deadline: '', weight: 0 },
        { id: 2, name: 'Ex: Améliorer la productivité', desc: '', measure: '', deadline: '', weight: 40 }
    ]);
    const [employeeObjectiveComments, setEmployeeObjectiveComments] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<EmployeeView | null>(null);

    // Données pour les graphiques du Dashboard
    const mockBarData = [
        { name: 'S1', notes: 3.2, moyenneDept: 3.0 },
        { name: 'S2', notes: 3.5, moyenneDept: 3.1 },
        { name: 'S3', notes: 3.8, moyenneDept: 3.3 },
        { name: 'S4', notes: 3.6, moyenneDept: 3.4 },
    ];

    const mockPieData = [
        { name: 'Objectifs Atteints', value: 75, color: '#9A9750' },
        { name: 'En Cours', value: 20, color: '#F26322' },
        { name: 'Non Atteints', value: 5, color: '#463738' },
    ];

    const handleModifyTarget = (id: number, newVal: string) => {
        if (grade === 'NON_CADRE') {
            setNcKpis(prev => prev.map(k => k.id === id ? { ...k, desc: newVal, status: 'MODIFIED_BY_EMP' } : k));
        }
    };

    const submitCoConstruction = () => {
        setWorkflowStep('WAITING_N1');
    };

    const handleFileChange = (kpiId: number, file: File | null) => {
        if (file) {
            setEvalFiles(prev => ({ ...prev, [kpiId]: file }));
        }
    };

    const handleCommentChange = (kpiId: number, comment: string) => {
        setEvalComments(prev => ({ ...prev, [kpiId]: comment }));
    };

    const handleSaveEvaluation = () => {
        if (currentUser) {
            localStorage.setItem(`eval_scores_${currentUser.id_usercount}`, JSON.stringify(evalScores));
            localStorage.setItem(`eval_comments_${currentUser.id_usercount}`, JSON.stringify(evalComments));
        }
        setToastMessage("Brouillon d'évaluation sauvegardé avec succès.");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSubmitEvaluation = () => {
        if (currentUser) {
            localStorage.setItem(`eval_submitted_${currentUser.id_usercount}`, 'true');
            localStorage.setItem(`eval_scores_${currentUser.id_usercount}`, JSON.stringify(evalScores));
            localStorage.setItem(`eval_comments_${currentUser.id_usercount}`, JSON.stringify(evalComments));
        }
        setToastMessage("Auto-évaluation soumise au Manager pour validation.");
        setTimeout(() => setToastMessage(null), 3000);
        setTimeout(() => setActiveView(null), 3500);
    };

    const handleAddObjective = () => {
        setObjectiveDrafts([...objectiveDrafts, { id: Date.now(), name: '', desc: '', measure: '', deadline: '', weight: 0 }]);
    };

    const handleRemoveObjective = (id: number) => {
        if (objectiveDrafts.length > 1) {
            setObjectiveDrafts(objectiveDrafts.filter(obj => obj.id !== id));
        } else {
            setToastMessage("Vous devez avoir au moins un objectif.");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleUpdateObjective = (id: number, field: string, value: string | number) => {
        setObjectiveDrafts(objectiveDrafts.map(obj => obj.id === id ? { ...obj, [field]: value } : obj));
    };

    const totalWeight = objectiveDrafts.reduce((sum, obj) => sum + (Number(obj.weight) || 0), 0);

    const StarRating = ({ kpiId }: { kpiId: number }) => {
        const score = evalScores[kpiId] || 0;
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((star) => (
                    <button
                        key={star}
                        onClick={() => setEvalScores(prev => ({ ...prev, [kpiId]: star }))}
                        title={star === 1 ? "Faible" : star === 2 ? "Passable" : star === 3 ? "Bon" : "Excellent"}
                        className={`transition-colors ${score >= star ? 'text-[#F26322]' : 'text-slate-200 hover:text-[#F26322]/50'}`}
                    >
                        <Star size={24} fill={score >= star ? "currentColor" : "none"} />
                    </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[#A39D98] self-center">
                    {score === 1 ? "Faible (1)" : score === 2 ? "Passable (2)" : score === 3 ? "Bon (3)" : score === 4 ? "Excellent (4)" : "Non noté"}
                </span>
            </div>
        );
    };

    return (
        <div className="w-[calc(100vw-64px)] sm:w-full relative h-[calc(100vh-250px)] flex flex-col font-sans overflow-hidden">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#463738] text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
                    <CheckCircle size={18} className="text-[#9A9750]" />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}

            {/* Topbar */}


            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1200px] mx-auto w-full">

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-[28px] font-bold text-[#463738] mb-1">Mon Profil</h2>
                        <p className="text-[#A39D98] text-[15px]">Gérez votre profil, vos objectifs de performance et vos évaluations.</p>
                    </div>
                </div>

                {/* Actions principales Navigation Grid */}
                <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-[#F26322] font-bold text-lg mb-4 flex items-center gap-2">
                        <User size={20} /> Actions principales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveView('PROFILE')}
                            className={`p-6 rounded-lg font-bold text-[17px] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 ${activeView === 'PROFILE' ? 'ring-4 ring-offset-2 ring-[#463738]/30 shadow-lg' : 'shadow hover:shadow-md'}`}
                            style={{ background: 'linear-gradient(to right, #8e8584, #4a3f3d)', color: 'white' }}
                        >
                            <User size={24} /> Mon profil
                        </button>
                        <button
                            onClick={() => setActiveView('OBJECTIVES')}
                            className={`p-6 rounded-lg font-bold text-[17px] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 ${activeView === 'OBJECTIVES' ? 'ring-4 ring-offset-2 ring-[#9A9750]/30 shadow-lg' : 'shadow hover:shadow-md'}`}
                            style={{ background: 'linear-gradient(to right, #b3b97b, #8f917b)', color: 'white' }}
                        >
                            <TrendingUp size={24} /> Mes objectifs de performance
                        </button>
                        <button
                            onClick={() => setActiveView('EVALUATION')}
                            className={`p-6 rounded-lg font-bold text-[17px] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 ${activeView === 'EVALUATION' ? 'ring-4 ring-offset-2 ring-[#7B7B45]/30 shadow-lg' : 'shadow hover:shadow-md'}`}
                            style={{ background: 'linear-gradient(to right, #50443b, #9e9e5e)', color: 'white' }}
                        >
                            <CheckCircle size={24} /> Mon auto-évaluation
                        </button>
                        <button
                            onClick={() => setActiveView('DASHBOARD')}
                            className={`p-6 rounded-lg font-bold text-[17px] flex items-center justify-center gap-4 transition-all hover:-translate-y-1 ${activeView === 'DASHBOARD' ? 'ring-4 ring-offset-2 ring-[#F26322]/30 shadow-lg' : 'shadow hover:shadow-md'}`}
                            style={{ background: 'linear-gradient(to right, #ee7329, #53392d)', color: 'white' }}
                        >
                            <LayoutDashboard size={24} /> Dashboard de l'Employé
                        </button>
                    </div>
                </div>

                {activeView === 'PROFILE' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#463738]/30 overflow-y-auto animate-in fade-in duration-300">
                        <div className="w-full max-w-4xl bg-[#E3E1DB] rounded-xl p-8 border border-white relative shadow-2xl my-auto">
                            {/* Modal Header */}
                            <div className="flex flex-col gap-2 mb-6 border-b border-[#A39D98]/20 pb-4">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                                    <span className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors" onClick={() => setActiveView(null)}><Home size={14} className="mb-0.5" /> 🏠 Retour Espace Personnel</span>
                                    <ChevronRight size={14} />
                                    <span className="text-[#F26322]">Mon Profil</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-[22px] font-black text-[#F26322] flex items-center gap-2">
                                            <User size={24} /> Mon profil
                                        </h3>
                                        <p className="text-[#8c847e] text-sm font-medium mt-1">Consultez vos informations personnelles et professionnelles</p>
                                    </div>
                                    <button onClick={() => setActiveView(null)} className="text-[#A39D98] hover:text-[#463738] transition-colors p-1 bg-[#E3E1DB]/50 rounded-full" title="Fermer">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Card 1: Personnelles */}
                                <div className="bg-white rounded-xl border-[1.5px] border-[#F26322] p-6 shadow-sm relative">
                                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                        <User size={18} className="text-[#F26322]" /> Informations Personnelles
                                    </h4>
                                    {/* ─ Zone Photo de Profil ──────────────────────────────── */}
                                    <div className="col-span-2 flex items-center gap-6 mb-2 p-4 bg-[#f9f8f7] rounded-xl border border-dashed border-[#F26322]/40">
                                        {/* Prévisualisation */}
                                        <div className="relative shrink-0">
                                            {userPhotoUrl ? (
                                                <img
                                                    src={userPhotoUrl}
                                                    alt="Photo de profil"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#F26322] shadow-md"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-[#F26322] text-white flex items-center justify-center text-2xl font-black border-4 border-[#F26322]/30 shadow">
                                                    {currentUser?.nom_prenoms?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                                                </div>
                                            )}
                                            {userPhotoUrl && (
                                                <button
                                                    onClick={handleRemovePhoto}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                                                    title="Supprimer la photo"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        {/* Zone de téléchargement */}
                                        <div className="flex-1">
                                            <p className="text-[13px] font-bold text-[#463738] mb-1">Photo de Profil</p>
                                            <p className="text-[11px] text-[#A39D98] mb-3">Formats acceptés : JPG, PNG, WEBP — Max 5 Mo</p>
                                            <label
                                                htmlFor="photo-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F26322] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#d45a1e] transition-colors shadow-sm active:scale-95"
                                            >
                                                <UploadCloud size={16} />
                                                {userPhotoUrl ? 'Changer la photo' : 'Télécharger votre photo ici !'}
                                            </label>
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={handlePhotoUpload}
                                            />
                                            {photoSaveMsg && (
                                                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle size={13} /> {photoSaveMsg}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Matricule</label>
                                            <input readOnly value={currentUser?.id_usercount ?? ''} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#F26322] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Nom et Prénoms</label>
                                            <input value={localName} onChange={(e) => setLocalName(e.target.value)} className="w-full bg-white border border-[#A39D98]/20 rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#F26322] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Date de Naissance</label>
                                            <input value={localBirthDate} onChange={(e) => setLocalBirthDate(e.target.value)} className="w-full bg-white border border-[#A39D98]/20 rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#F26322] transition-all outline-none" placeholder="JJ/MM/AAAA" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Usercount (Email)</label>
                                            <input readOnly value={currentUser?.usercount ?? ''} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#F26322] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Numéro de Téléphone</label>
                                            <input value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} className="w-full bg-white border border-[#A39D98]/20 rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#F26322] transition-all outline-none" placeholder="+Indicatif Numéro" />
                                        </div>
                                    </div>

                                </div>

                                {/* Card 2: Professionnelles */}
                                <div className="bg-white rounded-xl border border-[#9A9750] p-6 shadow-sm">
                                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                        <LayoutDashboard size={18} className="text-[#9A9750]" /> Informations Professionnelles
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Fonction / Poste Occupé</label>
                                            <input readOnly value={currentUser?.fonction ?? 'EMPLOYE'} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Date d'Embauche</label>
                                            <input value={localHireDate} onChange={(e) => setLocalHireDate(e.target.value)} className="w-full bg-white border border-[#A39D98]/20 rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" placeholder="JJ/MM/AAAA" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Département</label>
                                            <input readOnly value={currentUser?.departement ?? 'PRODUCTION'} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Service d'Affectation</label>
                                            <input readOnly value={currentUser?.scope ?? 'Non défini'} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Site ou Bureau d'Affectation</label>
                                            <input readOnly value={currentUser?.scope ?? 'Sissengue'} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Pays d'Affectation</label>
                                            <input readOnly value={currentUser?.pays ?? "Côte d'Ivoire"} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] focus:ring-1 focus:ring-[#9A9750] transition-all outline-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Manager Direct (N+1) */}
                                <div className="bg-white rounded-xl border border-[#463738] p-6 shadow-sm">
                                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                        <User size={18} className="text-[#463738]" /> Manager Direct (Évaluateur N+1)
                                    </h4>
                                    {managerN1 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            <div>
                                                <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Nom et Prénoms</label>
                                                <input readOnly value={managerN1.nom_prenoms} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Usercount (Email)</label>
                                                <input readOnly value={managerN1.usercount} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Département</label>
                                                <input readOnly value={managerN1.departement} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                            </div>
                                            <div className="">
                                                <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Fonction / Poste Occupé</label>
                                                <input readOnly value={managerN1.fonction} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#A39D98] italic">Aucun évaluateur N+1 défini pour ce compte.</p>
                                    )}
                                </div>

                                {/* Card 4: Manager N+2 */}
                                <div className="bg-white rounded-xl border border-[#463738]/50 p-6 shadow-sm">
                                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                        <User size={18} className="text-[#463738]/70" /> Manager N+2 (Calibration)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Nom et Prénoms</label>
                                            <input readOnly value={managerN2.nom_prenoms} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Email</label>
                                            <input readOnly value={managerN2.usercount} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block">Fonction / Poste Occupé</label>
                                            <input readOnly value={managerN2.fonction} className="w-full bg-[#f6f6f6] border-none rounded-md px-4 py-2.5 text-[#463738] font-medium text-[15px] outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-[#A39D98]/20">
                                <button onClick={() => setActiveView(null)} className="px-5 py-2.5 border-[1.5px] border-[#F26322] text-[#F26322] bg-white rounded-md font-bold text-[13px] hover:bg-orange-50 transition-colors flex items-center gap-2">
                                    Retour Menu
                                </button>
                                <button onClick={() => { setToastMessage("Profil mis à jour avec succès."); setTimeout(() => setToastMessage(null), 3000); }} className="px-5 py-2.5 bg-[#F26322] text-white rounded-md font-bold text-[13px] shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <CheckCircle size={16} /> Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                {
                    activeView === 'OBJECTIVES' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#463738]/30 overflow-y-auto animate-in fade-in duration-300">
                            <div className="w-full max-w-[1400px] bg-[#f3f2ef] rounded-xl pt-2 shadow-2xl relative my-auto">
                                {/* Header avec croix */}
                                <div className="flex flex-col gap-3 px-6 py-4 border-b border-[#E3E1DB] bg-white rounded-t-xl">
                                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                                        <span className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors" onClick={() => setActiveView(null)}><Home size={14} className="mb-0.5" /> 🏠 Retour Espace Personnel</span>
                                        <ChevronRight size={14} />
                                        <span className="text-[#F26322]">Mes objectifs de performance</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-[20px] font-black text-[#625953] flex items-center gap-2">
                                                <TrendingUp size={22} className="text-[#9A9750]" /> Mes objectifs de performance
                                            </h3>
                                        </div>
                                        <button onClick={() => setActiveView(null)} className="text-[#A39D98] hover:text-[#463738] transition-colors p-1 bg-[#E3E1DB]/50 rounded-full">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-t border border-[#E3E1DB] shadow-sm overflow-hidden overflow-x-auto">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-[1fr_2fr_2fr_180px_100px_80px] min-w-[1000px] bg-[#2B5C3F] text-white text-[11px] font-bold uppercase tracking-wider">
                                        <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Nom Objectif</div>
                                        <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Description</div>
                                        <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Critères de mesure</div>
                                        <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Délai</div>
                                        <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Poids %</div>
                                        <div className="px-4 py-3 text-center flex items-center justify-center">Actions</div>
                                    </div>

                                    {/* Table Body (Rows) */}
                                    <div className="divide-y divide-[#E3E1DB] min-w-[1000px]">
                                        {objectiveDrafts.map((obj, index) => (
                                            <div key={obj.id} className="grid grid-cols-[1fr_2fr_2fr_180px_100px_80px] bg-white items-start">
                                                <div className="p-3 border-r border-[#E3E1DB] h-full flex items-center">
                                                    <input
                                                        value={obj.name}
                                                        onChange={(e) => handleUpdateObjective(obj.id, 'name', e.target.value)}
                                                        className="w-full border border-[#d1d1d1] rounded px-3 py-2.5 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none shadow-sm"
                                                        placeholder="Ex: Améliorer la productivité"
                                                    />
                                                </div>
                                                <div className="p-3 border-r border-[#E3E1DB] h-full">
                                                    <textarea
                                                        value={obj.desc}
                                                        onChange={(e) => handleUpdateObjective(obj.id, 'desc', e.target.value)}
                                                        className="w-full border border-[#d1d1d1] rounded px-3 py-2 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none min-h-[70px] resize-y shadow-sm"
                                                        placeholder="Décrivez l'objectif en détail..."
                                                    />
                                                </div>
                                                <div className="p-3 border-r border-[#E3E1DB] h-full">
                                                    <textarea
                                                        value={obj.measure}
                                                        onChange={(e) => handleUpdateObjective(obj.id, 'measure', e.target.value)}
                                                        className="w-full border border-[#d1d1d1] rounded px-3 py-2 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none min-h-[70px] resize-y shadow-sm"
                                                        placeholder="Comment mesurer la réussite..."
                                                    />
                                                </div>
                                                <div className="p-3 border-r border-[#E3E1DB] h-full flex items-center justify-center">
                                                    <input
                                                        type="date"
                                                        value={obj.deadline}
                                                        onChange={(e) => handleUpdateObjective(obj.id, 'deadline', e.target.value)}
                                                        className="w-full border border-[#d1d1d1] rounded px-3 py-2.5 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none shadow-sm"
                                                    />
                                                </div>
                                                <div className="p-3 border-r border-[#E3E1DB] h-full flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        value={obj.weight}
                                                        onChange={(e) => handleUpdateObjective(obj.id, 'weight', parseInt(e.target.value) || 0)}
                                                        className="w-full border border-[#d1d1d1] rounded px-3 py-2.5 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none shadow-sm text-right"
                                                    />
                                                </div>
                                                <div className="p-3 h-full flex items-center justify-center">
                                                    <button onClick={() => handleRemoveObjective(obj.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors" title="Supprimer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button Add */}
                                <div className="mt-4 px-6">
                                    <button onClick={handleAddObjective} className="flex items-center gap-2 px-4 py-2 bg-[#E9EBE2] text-[#7A863B] border border-[#d1d6bc] rounded font-bold text-sm hover:bg-[#dce0c8] transition-colors shadow-sm">
                                        <Plus size={16} /> Ajouter un objectif
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="mt-4 px-6">
                                    <label className="text-[13px] font-bold text-[#625953] mb-2 block">Commentaires de l'Employé (optionnel)</label>
                                    <textarea
                                        value={employeeObjectiveComments}
                                        onChange={(e) => setEmployeeObjectiveComments(e.target.value)}
                                        className="w-full border border-[#d1d1d1] rounded bg-white p-4 text-[13px] text-[#463738] focus:border-[#2B5C3F] outline-none min-h-[100px] resize-y shadow-sm"
                                        placeholder="Ajoutez vos commentaires..."
                                    ></textarea>
                                </div>

                                {/* Footer Totals and Actions */}
                                <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#E2E1D9] rounded-b-xl px-6 py-4 border-t border-[#A39D98]/30">
                                    <div className="text-[13px] text-[#8c847e] font-medium">
                                        {objectiveDrafts.length} objectif(s) • Total poids: <span className={`${totalWeight !== 100 ? 'text-red-600 font-bold' : 'text-[#7A863B] font-bold'}`}>{totalWeight}%</span>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setActiveView(null)} className="px-5 py-2 bg-white text-[#463738] rounded font-bold text-[13px] hover:bg-slate-50 transition-colors border border-[#d1d1d1] shadow-sm">
                                            Fermer
                                        </button>
                                        <button onClick={() => { setToastMessage("Objectifs enregistrés en brouillon."); setTimeout(() => setToastMessage(null), 3000); }} className="px-5 py-2 bg-[#F26322] text-white rounded font-bold text-[13px] shadow-sm hover:bg-[#eb5b1b] transition-colors flex items-center gap-2">
                                            <FilePlus size={16} /> Enregistrer
                                        </button>
                                        <button onClick={() => { setToastMessage("Objectifs soumis au Manager pour validation."); setTimeout(() => setToastMessage(null), 3000); setTimeout(() => setActiveView(null), 3500); }} className="px-5 py-2 bg-[#9A9750] text-white rounded font-bold text-[13px] shadow-sm hover:bg-[#8d8a49] transition-colors flex items-center gap-2">
                                            <CheckCircle size={16} /> Soumettre au Manager
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeView === 'EVALUATION' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#463738]/30 overflow-y-auto animate-in fade-in duration-300">
                            <div className="w-full max-w-[1500px] bg-[#f3f2ef] rounded-xl pt-2 shadow-2xl relative my-auto">
                                {/* Modal Header */}
                                <div className="px-6 py-4 flex flex-col gap-3 bg-white rounded-t-xl border-b border-[#E3E1DB]">
                                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                                        <span className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors" onClick={() => setActiveView(null)}><Home size={14} className="mb-0.5" /> 🏠 Retour Espace Personnel</span>
                                        <ChevronRight size={14} />
                                        <span className="text-[#F26322]">Mon Auto-Évaluation</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-[20px] font-black text-[#A39D98] flex items-center gap-2">
                                                <CheckCircle size={22} className="text-[#9A9750]" /> <span className="text-[#625953] font-black">Mon Auto-Évaluation</span>
                                            </h3>
                                            <p className="text-[#A39D98] text-sm font-medium mt-1">Évaluez votre performance sur vos objectifs approuvés</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <button onClick={() => { setToastMessage("Historique d'évaluation bientôt disponible."); setTimeout(() => setToastMessage(null), 3000); }} className="flex items-center gap-2 px-4 py-2 border border-[#d1d6bc] bg-transparent text-[#9A9750] rounded font-bold text-sm hover:bg-[#E9EBE2] transition-colors shadow-sm">
                                                <History size={16} /> Historique
                                            </button>
                                            <button onClick={() => setActiveView(null)} className="text-[#A39D98] hover:text-[#463738] ml-2 p-1 bg-[#E3E1DB]/50 rounded-full">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* ─── BLOCAGE : objectifs non encore validés par N+1 ─── */}
                                {workflowStep !== 'EVALUATION' ? (
                                    <div className="px-8 py-16 flex flex-col items-center justify-center text-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
                                            <Lock size={36} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-[18px] font-black text-[#463738] mb-2">
                                                Auto-Évaluation non disponible
                                            </h4>
                                            <p className="text-[#A39D98] text-[14px] max-w-md leading-relaxed">
                                                {workflowStep === 'CO_CONSTRUCTION'
                                                    ? 'Vous devez d\'abord rédiger vos objectifs de performance et les soumettre à votre Évaluateur N+1 pour validation avant d\'accéder à cette section.'
                                                    : 'Vos objectifs ont été soumis à votre Évaluateur N+1. En attente de sa validation avant de débloquer l\'auto-évaluation.'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full ${workflowStep === 'CO_CONSTRUCTION' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                                {workflowStep === 'CO_CONSTRUCTION'
                                                    ? '① En cours de rédaction des objectifs'
                                                    : '② En attente de validation N+1'}
                                            </div>
                                            <div className="text-xs text-[#A39D98]">③ Auto-évaluation → ④ Évaluation N+1 → ⑤ Calibration N+2</div>
                                        </div>
                                        <button
                                            onClick={() => setActiveView('OBJECTIVES')}
                                            className="px-6 py-2.5 bg-[#F26322] text-white rounded-lg font-bold text-sm shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                                        >
                                            <TrendingUp size={16} />
                                            {workflowStep === 'CO_CONSTRUCTION' ? 'Aller à Mes Objectifs' : 'Voir mes objectifs soumis'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden overflow-x-auto">
                                        {/* Table Header */}
                                        <div className="bg-white border-b border-[#E3E1DB]">
                                            <div className="grid grid-cols-[1.2fr_3fr_3fr_110px_160px_180px_240px] min-w-[1250px] bg-[#2B5C3F] text-white text-[10px] font-bold uppercase tracking-wider">
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Objectifs</div>
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Description de l&apos;Objectif (KPI)</div>
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Mesure</div>
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Échéance</div>
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Évaluation</div>
                                                <div className="px-4 py-3 border-r border-white/20 text-center flex items-center justify-center">Livrables</div>
                                                <div className="px-4 py-3 text-center flex items-center justify-center">Commentaires</div>
                                            </div>
                                            {/* Table Body */}
                                            <div className="divide-y divide-[#E3E1DB] min-w-[1250px]">
                                                {(grade === 'NON_CADRE' ? ncKpis : mgrKpis.performance).map((kpi, index) => {
                                                    const score = evalScores[kpi.id] || 0;
                                                    return (
                                                        <div key={kpi.id} className="grid grid-cols-[1.2fr_3fr_3fr_110px_160px_180px_240px] bg-white items-stretch hover:bg-slate-50 transition-colors">
                                                            <div className="p-4 border-r border-[#E3E1DB] flex items-center justify-center text-center">
                                                                <span className="text-[13px] text-[#463738] font-bold">Objectif {index + 1}</span>
                                                            </div>
                                                            <div className="p-4 border-r border-[#E3E1DB] flex items-center">
                                                                <span className="text-[13px] text-[#463738] leading-relaxed">{kpi.desc}</span>
                                                            </div>
                                                            <div className="p-4 border-r border-[#E3E1DB] flex items-center">
                                                                <span className="text-[13px] text-[#463738] leading-relaxed">{kpi.measure || "Non défini"}</span>
                                                            </div>
                                                            <div className="p-4 border-r border-[#E3E1DB] flex items-center justify-center text-center">
                                                                <span className="text-[13px] text-[#463738] font-medium">31/12/2025</span>
                                                            </div>
                                                            <div className="p-4 border-r border-[#E3E1DB] flex flex-col items-center justify-center gap-2">
                                                                <div className="flex gap-1 items-center justify-center">
                                                                    {[1, 2, 3, 4].map((star) => (
                                                                        <button key={star} type="button"
                                                                            onClick={() => setEvalScores(prev => ({ ...prev, [kpi.id]: star }))}
                                                                            title={star === 1 ? "Faible (1)" : star === 2 ? "Passable (2)" : star === 3 ? "Bon (3)" : "Excellent (4)"}
                                                                            className={`cursor-pointer transition-transform hover:scale-125 focus:outline-none ${score >= star ? 'text-[#F26322]' : 'text-slate-200 hover:text-[#f26322]/50'}`}>
                                                                            <Star size={20} fill={score >= star ? "currentColor" : "currentColor"} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold tracking-wide uppercase text-[#A39D98]">
                                                                    {score === 1 ? "Faible" : score === 2 ? "Passable" : score === 3 ? "Bon" : score === 4 ? "Excellent" : "Non évalué"}
                                                                </span>
                                                            </div>
                                                            <div className="p-3 border-r border-[#E3E1DB] flex flex-col items-center justify-center">
                                                                <label className={`w-full h-full min-h-[70px] border-2 border-dashed ${evalFiles[kpi.id] ? 'border-[#9A9750] bg-[#E9EBE2]' : 'border-[#d1d1d1] bg-slate-50'} rounded hover:bg-[#E9EBE2] cursor-pointer transition-colors flex flex-col items-center justify-center p-2 text-center group`}>
                                                                    {evalFiles[kpi.id] ? (
                                                                        <><FileText size={18} className="text-[#9A9750] mb-1" /><span className="text-[9px] text-[#7A863B] font-bold uppercase tracking-wider leading-tight truncate w-full px-1">{evalFiles[kpi.id]?.name}</span></>
                                                                    ) : (
                                                                        <><UploadCloud size={18} className="text-[#A39D98] mb-1 group-hover:text-[#9A9750] transition-colors" /><span className="text-[9px] text-[#A39D98] font-bold uppercase tracking-wider group-hover:text-[#7A863B] transition-colors leading-tight">Joindre Fichier</span></>
                                                                    )}
                                                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleFileChange(kpi.id, e.target.files?.[0] || null)} />
                                                                </label>
                                                            </div>
                                                            <div className="p-3 flex items-center">
                                                                <textarea value={evalComments[kpi.id] || ''} onChange={(e) => handleCommentChange(kpi.id, e.target.value)}
                                                                    className="w-full border border-[#d1d1d1] bg-white rounded px-3 py-2 text-[12px] text-[#463738] focus:border-[#2B5C3F] outline-none h-[70px] resize-none shadow-sm"
                                                                    placeholder="Vos commentaires..." />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Score Card */}
                                        <div className="mx-6 mt-6 mb-4 flex justify-between items-center bg-[#E9EBE2] border border-[#d1d6bc] px-6 py-4 rounded shadow-sm">
                                            {(() => {
                                                const currentKpis = grade === 'NON_CADRE' ? ncKpis : mgrKpis.performance;
                                                const evaluatedCount = currentKpis.filter(kpi => evalScores[kpi.id]).length;
                                                const sumScores = currentKpis.reduce((acc, kpi) => acc + (evalScores[kpi.id] || 0), 0);
                                                const avgScore = evaluatedCount > 0 ? (sumScores / evaluatedCount).toFixed(1) : "0.0";
                                                return (
                                                    <>
                                                        <div>
                                                            <span className="text-[12px] font-bold text-[#7A863B] block mb-1">Note moyenne de l&apos;Auto-évaluation</span>
                                                            <div className="text-[24px] font-black text-[#F26322] flex items-center gap-2">{avgScore}/4 <Star size={20} className="fill-[#F26322]" /></div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[12px] font-bold text-[#7A863B] block mb-1">Objectifs évalués</span>
                                                            <div className="text-[24px] font-black text-[#463738]">{evaluatedCount}/{currentKpis.length}</div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-4 pt-4 border-t border-[#A39D98]/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#E2E1D9] rounded-b-xl px-6 py-4">
                                            <div className="text-[13px] text-[#8c847e] font-medium">
                                                {(grade === 'NON_CADRE' ? ncKpis : mgrKpis.performance).length} objectif(s) à évaluer
                                            </div>
                                            <div className="flex gap-3 justify-end">
                                                <button onClick={() => setActiveView(null)} className="px-5 py-2 bg-white text-[#463738] rounded font-bold text-[13px] hover:bg-slate-50 transition-colors border border-[#d1d1d1] shadow-sm">Fermer</button>
                                                <button onClick={handleSaveEvaluation} className="px-5 py-2 bg-[#9A9750] text-white rounded font-bold text-[13px] shadow-sm hover:bg-[#8d8a49] transition-colors flex items-center gap-2">
                                                    <CheckCircle size={16} /> Sauvegarder
                                                </button>
                                                <button onClick={handleSubmitEvaluation} className="px-5 py-2 bg-[#F26322] text-white rounded font-bold text-[13px] shadow-sm hover:bg-[#eb5b1b] transition-colors flex items-center gap-2">
                                                    <CheckCircle size={16} /> Soumettre l&apos;évaluation
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }


                {
                    activeView === 'DASHBOARD' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-start py-8 px-4 bg-[#463738]/30 overflow-y-auto animate-in fade-in duration-300">
                            <div className="w-full max-w-6xl bg-[#f3f2ef] rounded-xl shadow-2xl relative my-auto p-8">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98] mb-4">
                                    <span className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors" onClick={() => setActiveView(null)}><Home size={14} className="mb-0.5" /> 🏠 Retour Espace Personnel</span>
                                    <ChevronRight size={14} />
                                    <span className="text-[#F26322]">Dashboard & Data Vault</span>
                                </div>
                                {/* Bouton de fermeture */}
                                <button onClick={() => setActiveView(null)} className="absolute top-6 right-6 text-[#A39D98] hover:text-[#463738] transition-colors p-2 bg-white rounded-full shadow-sm">
                                    <X size={20} />
                                </button>

                                <div className="flex items-center justify-between mb-6 border-b border-[#A39D98]/20 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#463738]">Dashboard & Data Vault</h3>
                                        <p className="text-sm font-medium text-[#A39D98]">Vue synthétique de la performance et de l'historique.</p>
                                    </div>
                                    <span className="bg-[#463738] text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm mr-10">Accès Confidentiel</span>
                                </div>

                                {/* Graphiques */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-4 animate-in slide-in-from-bottom-5 duration-300">
                                    {/* Histogramme (BarChart) */}
                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 p-6">
                                        <h4 className="font-bold text-[#463738] text-[15px] mb-6 flex items-center gap-2">
                                            <TrendingUp size={18} className="text-[#F26322]" /> Évolution des Évaluations (Trimestriel)
                                        </h4>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={mockBarData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E1DB" vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A39D98', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A39D98', fontSize: 12 }} domain={[0, 4]} />
                                                    <Tooltip
                                                        cursor={{ fill: '#f6f6f6' }}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E3E1DB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#463738' }} />
                                                    <Bar dataKey="notes" name="Mes Notes" fill="#F26322" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                    <Bar dataKey="moyenneDept" name="Moy. Département" fill="#9A9750" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Camembert (PieChart) */}
                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 p-6 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-[#463738] text-[15px] mb-2 flex items-center gap-2">
                                                <Target size={18} className="text-[#9A9750]" /> Répartition des Objectifs (Année en cours)
                                            </h4>
                                            <p className="text-xs text-[#A39D98] font-medium mb-4">Aperçu visuel de vos KPIs de performance.</p>
                                        </div>
                                        <div className="h-[200px] w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={mockPieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {mockPieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Texte centré dans le Donut */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-2xl font-black text-[#463738]">75%</span>
                                                <span className="text-[10px] font-bold text-[#A39D98] uppercase tracking-wider">Atteints</span>
                                            </div>
                                        </div>

                                        {/* Légende personnalisée */}
                                        <div className="flex justify-center gap-4 mt-6">
                                            {mockPieData.map((item, i) => (
                                                <div key={i} className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-xs font-bold text-[#463738]">{item.name} <span className="text-[#A39D98] font-medium">({item.value}%)</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* MODULE DATA VAULT */}
                                <div className="mt-8 animate-in slide-in-from-bottom-5 duration-300">
                                    <h3 className="text-xl font-bold text-[#463738] mb-4 flex items-center gap-2">
                                        <Lock size={20} className="text-[#A39D98]" /> Mon Coffre-Fort Numérique (Data Vault)
                                    </h3>
                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                        <div className="bg-[#463738] px-6 py-3 text-white flex justify-between items-center text-sm font-bold">
                                            <span>Archives de Carrière & Évaluations</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Périmètre strictement confidentiel</span>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex gap-4 items-center opacity-50 cursor-not-allowed">
                                                    <div className="w-10 h-10 bg-[#E3E1DB] rounded-full flex items-center justify-center shrink-0">
                                                        <FileText size={18} className="text-[#A39D98]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-[#A39D98]">Évaluation Annuelle 2024</h4>
                                                        <p className="text-[11px] text-[#A39D98]">Aucun document disponible</p>
                                                    </div>
                                                </div>
                                                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex gap-4 items-center opacity-50 cursor-not-allowed">
                                                    <div className="w-10 h-10 bg-[#E3E1DB] rounded-full flex items-center justify-center shrink-0">
                                                        <FileText size={18} className="text-[#A39D98]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-[#A39D98]">Contrat d'Objectifs 2024</h4>
                                                        <p className="text-[11px] text-[#A39D98]">Aucun document disponible</p>
                                                    </div>
                                                </div>
                                                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex gap-4 items-center opacity-50">
                                                    <div className="w-10 h-10 bg-[#E3E1DB] rounded-full flex items-center justify-center shrink-0">
                                                        <Lock size={18} className="text-[#A39D98]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-[#A39D98]">Matrice 9-Box Historique</h4>
                                                        <p className="text-[11px] text-[#A39D98]">Accès restreint aux Administrateurs</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODULE ACTION TRACKING */}
                                <div className="mt-8 animate-in slide-in-from-bottom-5 duration-300">
                                    <h3 className="text-xl font-bold text-[#463738] mb-4 flex items-center gap-2">
                                        <ClipboardList size={20} className="text-[#F26322]" /> Suivi des Actions de Réalisation (Plan d'Action)
                                    </h3>
                                    <div className="bg-white rounded-xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[#EBEAE5] text-[#463738] text-[11px] uppercase tracking-wider">
                                                        <th className="px-4 py-3 font-bold border-b border-[#E3E1DB]">Action / Jalon</th>
                                                        <th className="px-4 py-3 font-bold border-b border-[#E3E1DB]">Objectif Lié</th>
                                                        <th className="px-4 py-3 font-bold border-b border-[#E3E1DB] w-[140px]">Échéance</th>
                                                        <th className="px-4 py-3 font-bold border-b border-[#E3E1DB] w-[160px]">Statut</th>
                                                        <th className="px-4 py-3 font-bold border-b border-[#E3E1DB]">Notes de suivi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-[13px] text-[#463738] divide-y divide-[#E3E1DB]">
                                                    <tr className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 font-medium">Lancer l'audit de sécurité des camions T3</td>
                                                        <td className="px-4 py-3 text-[#A39D98]">Objectif 1 (Safety)</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5 text-[#F26322] font-semibold text-[12px]">
                                                                <Calendar size={14} /> 15 Mars 2024
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded shadow-sm text-[11px] font-bold uppercase tracking-wider border border-green-200">Terminé</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-[#8c847e] text-xs">Rapport transmis au manager.</td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 font-medium">Révision des contrats fournisseurs (Opex)</td>
                                                        <td className="px-4 py-3 text-[#A39D98]">Objectif 2 (Costs)</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5 text-[#A39D98] font-semibold text-[12px]">
                                                                <Calendar size={14} /> 30 Juin 2024
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2.5 py-1 bg-[#F26322]/10 text-[#F26322] rounded shadow-sm text-[11px] font-bold uppercase tracking-wider border border-[#F26322]/20 flex items-center justify-center gap-1 max-w-max">
                                                                <Clock size={12} /> En Cours
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="text" placeholder="Ajouter une note de pointage... (et Entrée)" className="w-full text-xs px-2 py-1.5 border border-[#E3E1DB] rounded focus:border-[#9A9750] outline-none bg-[#f6f6f6]" onKeyDown={(e) => { if (e.key === 'Enter') { setToastMessage('Note de suivi enregistrée (Révision contrats).'); setTimeout(() => setToastMessage(null), 3000); (e.target as HTMLInputElement).value = ''; } }} />
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-[#A39D98]">Formation certifiante ISO 45001</td>
                                                        <td className="px-4 py-3 text-[#A39D98]">Objectif 4 (Dev Perso)</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5 text-[#A39D98] font-semibold text-[12px]">
                                                                <Calendar size={14} /> 15 Nov 2024
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[11px] font-bold uppercase tracking-wider border border-slate-200">À Venir</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="text" placeholder="Ajouter une note de pointage... (et Entrée)" className="w-full text-xs px-2 py-1.5 border border-[#E3E1DB] rounded focus:border-[#9A9750] outline-none hover:bg-[#f6f6f6] transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') { setToastMessage('Note de suivi enregistrée (Formation).'); setTimeout(() => setToastMessage(null), 3000); (e.target as HTMLInputElement).value = ''; } }} />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-3 border-t border-[#E3E1DB] flex justify-between items-center">
                                            <p className="text-xs text-[#A39D98] italic">Ce tableau d'avancement continu est visible par votre Evaluateur.</p>
                                            <button onClick={() => { setToastMessage("Ouverture du formulaire d'ajout de nouvelle action..."); setTimeout(() => setToastMessage(null), 3000); }} className="flex items-center gap-1.5 text-sm font-bold text-[#9A9750] hover:text-[#7A863B] transition-colors cursor-pointer">
                                                <Plus size={16} /> Ajouter une action
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main>
        </div >
    );
}
