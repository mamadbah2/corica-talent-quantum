"use client";

import React, { useState, useEffect } from 'react';
import {
    Users, UserX, CheckSquare, AlertTriangle, ShieldCheck,
    UserCheck, HelpCircle, PenTool, UploadCloud, FileText,
    X, Mail, MapPin, Briefcase, Building2, User, ChevronRight,
    CheckCircle, Star, MessageSquare, Plus, Trash2, Eye,
    ClipboardCheck, Send, Download, Lock, Clock, BarChart3, PieChart as PieChartIcon,
    TrendingUp, Target, ListChecks, Award, Home, Edit3, Search
} from 'lucide-react';
import { useUser, ALL_USERS, CoricaUser } from '@/context/UserContext';
import { printEvaluationForm } from '@/lib/printUtils';
import { UserAvatar } from '@/components/UserAvatar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkflowStep = 'PENDING' | 'KPI_SUBMITTED' | 'SELF_EVAL_DONE' | 'N1_EVAL_DONE' | 'COMPLETED';

interface TeamMember {
    user: CoricaUser;
    step: WorkflowStep;
    kpisCount: number;
    pdfUploaded: boolean;
}

// ─── Données simulées déterministes ──────────────────────────────────────────
function getStep(id: number): WorkflowStep {
    if (typeof window !== 'undefined') {
        if (localStorage.getItem(`n2_validated_${id}`) === 'true') return 'COMPLETED';
        if (localStorage.getItem(`n1_eval_submitted_${id}`) === 'true') return 'N1_EVAL_DONE';
        if (localStorage.getItem(`eval_submitted_${id}`) === 'true') return 'SELF_EVAL_DONE';
        if (localStorage.getItem(`kpi_submitted_${id}`) === 'true') return 'KPI_SUBMITTED';
    }
    const m = id % 4;
    if (m === 0) return 'COMPLETED';
    if (m === 1) return 'SELF_EVAL_DONE';
    if (m === 2) return 'KPI_SUBMITTED';
    return 'PENDING';
}

function progress(step: WorkflowStep) {
    return step === 'KPI_SUBMITTED' ? 25 : step === 'SELF_EVAL_DONE' ? 50 : step === 'N1_EVAL_DONE' ? 75 : step === 'COMPLETED' ? 100 : 5;
}
function barColor(step: WorkflowStep) {
    return step === 'KPI_SUBMITTED' ? 'bg-amber-400'
        : step === 'SELF_EVAL_DONE' ? 'bg-[#F26322]'
            : step === 'N1_EVAL_DONE' ? 'bg-[#9A9750]'
                : step === 'COMPLETED' ? 'bg-[#2B5C3F]' : 'bg-slate-300';
}
function borderColor(step: WorkflowStep) {
    return step === 'KPI_SUBMITTED' ? 'border-l-amber-500'
        : step === 'SELF_EVAL_DONE' ? 'border-l-[#F26322]'
            : step === 'COMPLETED' ? 'border-l-[#9A9750]' : 'border-l-slate-200';
}
function dotColor(step: WorkflowStep) {
    return step === 'KPI_SUBMITTED' ? 'bg-amber-500'
        : step === 'SELF_EVAL_DONE' ? 'bg-[#F26322]'
            : step === 'COMPLETED' ? 'bg-[#9A9750]' : 'bg-slate-300';
}

const MOCK_KPIS = [
    'Atteindre 95% de disponibilité sur la flotte de camions',
    'Zéro incident LTI sur le trimestre',
    'Réduire les coûts de maintenance de 10%',
    'Former 3 techniciens juniors',
];

// Helper : lit les vrais objectifs soumis par un employé depuis localStorage
function getEmployeeKpis(employeeId: number): { name: string; desc: string; measure: string; deadline: string; weight: number }[] | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`kpi_data_${employeeId}`);
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) return data;
    } catch { /* ignore */ }
    return null;
}

const STAR_LABELS = ['', 'Faible', 'Passable', 'Bon', 'Excellent'];

// ─── Modale : Revoir & Valider les KPIs ──────────────────────────────────────
type KpiRow = { name: string; desc: string; measure: string; deadline: string; weight: number };

function ModalReviewKpis({ member, onClose, addNotification }: { member: TeamMember; onClose: () => void; addNotification: (targetUserId: number, message: string, type?: 'info' | 'success' | 'warning', link?: string) => void }) {
    const realKpis = getEmployeeKpis(member.user.id_usercount);
    const fallback: KpiRow[] = MOCK_KPIS.slice(0, member.kpisCount).map((k, i) => ({
        name: k, desc: '', measure: '', deadline: '', weight: Math.round(100 / member.kpisCount)
    }));
    const initial: KpiRow[] = realKpis ?? fallback;

    const [rows, setRows] = useState<KpiRow[]>(initial);
    const [validated, setValidated] = useState<boolean[]>(Array(initial.length).fill(false));
    const [done, setDone] = useState(false);
    const allValidated = validated.every(Boolean) && rows.length > 0;

    const updateRow = (i: number, field: keyof KpiRow, value: string | number) => {
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
    };

    const toggleValidate = (i: number) => {
        setValidated(v => { const n = [...v]; n[i] = !n[i]; return n; });
    };

    if (done) return (
        <ModalShell title="KPIs Validés" member={member} accent="#9A9750" onClose={onClose} wide>
            <div className="flex flex-col items-center py-12 gap-4 px-8">
                <div className="w-20 h-20 bg-[#9A9750] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle size={40} className="text-white" />
                </div>
                <h4 className="text-xl font-black text-[#463738]">KPIs Validés !</h4>
                <p className="text-sm text-[#A39D98] text-center max-w-sm">
                    Les <strong>{rows.length} objectifs</strong> de <strong className="text-[#463738]">{member.user.nom_prenoms}</strong> ont été validés et verrouillés. L&apos;employé peut maintenant procéder à son auto-évaluation.
                </p>
                <button onClick={onClose} className="mt-2 px-8 py-3 bg-[#463738] text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">Fermer</button>
            </div>
        </ModalShell>
    );

    return (
        <ModalShell title="Révision & Validation des KPIs" member={member} accent="#d97706" onClose={onClose} wide>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                {!realKpis && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 font-medium flex items-center gap-2">
                        ⚠️ Aucun objectif trouvé pour cet employé. Ces données sont des exemples.
                    </div>
                )}
                <p className="text-sm text-[#A39D98] font-medium">
                    Révisez les <strong className="text-amber-600">{rows.length} objectif{rows.length > 1 ? 's' : ''}</strong> soumis par <strong className="text-[#463738]">{member.user.nom_prenoms}</strong>. Vous pouvez modifier les champs avant de valider chaque objectif.
                </p>

                <div className="space-y-4">
                    {rows.map((row, i) => (
                        <div
                            key={i}
                            className={`rounded-xl border-2 transition-all overflow-hidden ${validated[i] ? 'border-[#9A9750] bg-emerald-50' : 'border-[#E3E1DB] bg-white'}`}
                        >
                            {/* Header de l'objectif */}
                            <div className={`px-5 py-3 flex items-center justify-between ${validated[i] ? 'bg-[#9A9750]' : 'bg-[#2B5C3F]'}`}>
                                <span className="text-white font-black text-[13px] uppercase tracking-wider">
                                    Objectif {i + 1} {validated[i] && '✓ Validé'}
                                </span>
                                <button
                                    onClick={() => toggleValidate(i)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-[12px] transition-all ${validated[i] ? 'bg-white text-[#9A9750] hover:bg-emerald-50' : 'bg-amber-400 text-white hover:bg-amber-500'}`}
                                >
                                    {validated[i] ? <><CheckCircle size={13} /> Annuler</> : <><ClipboardCheck size={13} /> Valider</>}
                                </button>
                            </div>

                            {/* Corps : grille des champs */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nom Objectif */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Nom de l&apos;objectif</label>
                                    <input
                                        value={row.name}
                                        onChange={e => updateRow(i, 'name', e.target.value)}
                                        disabled={validated[i]}
                                        className={`w-full px-3 py-2.5 rounded-lg border text-[14px] font-semibold text-[#463738] outline-none transition-all ${validated[i] ? 'bg-transparent border-transparent cursor-default text-[#463738]' : 'bg-[#f8f7f5] border-[#E3E1DB] focus:border-amber-400 focus:bg-white'}`}
                                        placeholder="Ex : Réduire les accidents de 20%"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Description de l&apos;objectif</label>
                                    <textarea
                                        value={row.desc}
                                        onChange={e => updateRow(i, 'desc', e.target.value)}
                                        disabled={validated[i]}
                                        rows={2}
                                        className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-[#463738] outline-none resize-none transition-all ${validated[i] ? 'bg-transparent border-transparent cursor-default' : 'bg-[#f8f7f5] border-[#E3E1DB] focus:border-amber-400 focus:bg-white'}`}
                                        placeholder="Description détaillée de l'objectif…"
                                    />
                                </div>

                                {/* Critères de mesure */}
                                <div>
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Critères de mesure (KPI)</label>
                                    <textarea
                                        value={row.measure}
                                        onChange={e => updateRow(i, 'measure', e.target.value)}
                                        disabled={validated[i]}
                                        rows={2}
                                        className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-[#463738] outline-none resize-none transition-all ${validated[i] ? 'bg-transparent border-transparent cursor-default' : 'bg-[#f8f7f5] border-[#E3E1DB] focus:border-amber-400 focus:bg-white'}`}
                                        placeholder="Comment mesurer la réussite…"
                                    />
                                </div>

                                {/* Délai + Poids */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Délai (Échéance)</label>
                                        <input
                                            type="date"
                                            value={row.deadline}
                                            onChange={e => updateRow(i, 'deadline', e.target.value)}
                                            disabled={validated[i]}
                                            className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-[#463738] outline-none transition-all ${validated[i] ? 'bg-transparent border-transparent cursor-default' : 'bg-[#f8f7f5] border-[#E3E1DB] focus:border-amber-400 focus:bg-white'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Poids %</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0} max={100}
                                                value={row.weight}
                                                onChange={e => updateRow(i, 'weight', parseInt(e.target.value) || 0)}
                                                disabled={validated[i]}
                                                className={`w-24 px-3 py-2.5 rounded-lg border text-[13px] font-bold text-[#463738] outline-none text-right transition-all ${validated[i] ? 'bg-transparent border-transparent cursor-default' : 'bg-[#f8f7f5] border-[#E3E1DB] focus:border-amber-400 focus:bg-white'}`}
                                            />
                                            <span className={`text-[13px] font-black ${validated[i] ? 'text-[#9A9750]' : 'text-[#A39D98]'}`}>%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Barre de progression */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 bg-[#E3E1DB] rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 bg-[#9A9750] rounded-full transition-all duration-500"
                            style={{ width: `${rows.length > 0 ? (validated.filter(Boolean).length / rows.length) * 100 : 0}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-[#A39D98] shrink-0">{validated.filter(Boolean).length}/{rows.length} validés</span>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f6f5f3] border-t border-[#E3E1DB] px-6 py-4 flex justify-between items-center gap-3">
                <span className="text-xs text-[#A39D98] font-medium">
                    Poids total : <span className={`font-black ${rows.reduce((s, r) => s + (r.weight || 0), 0) !== 100 ? 'text-red-500' : 'text-[#9A9750]'}`}>
                        {rows.reduce((s, r) => s + (r.weight || 0), 0)}%
                    </span>
                </span>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border border-[#A39D98]/40 text-[#463738] rounded-lg font-bold text-sm hover:bg-slate-50">Annuler</button>
                    <button
                        onClick={() => {
                            if (allValidated) {
                                localStorage.setItem(`kpi_validated_${member.user.id_usercount}`, 'true');
                                addNotification(member.user.id_usercount, "Vos objectifs ont été validés par votre N+1.", "success", "/employee");
                                setDone(true);
                            }
                        }}
                        disabled={!allValidated}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${allValidated ? 'bg-[#9A9750] text-white hover:bg-[#858245]' : 'bg-[#E3E1DB] text-[#A39D98] cursor-not-allowed'}`}
                    >
                        <Send size={15} /> Valider & Notifier l&apos;Employé
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── Modale : Évaluation du Manager ──────────────────────────────────────────
function ModalEvaluer({ member, onClose, addNotification }: { member: TeamMember; onClose: () => void; addNotification: (targetUserId: number, message: string, type?: 'info' | 'success' | 'warning', link?: string) => void }) {
    const [scores, setScores] = useState<Record<number, number>>({});
    const [employeeScores, setEmployeeScores] = useState<Record<number, number>>({});
    const [hovered, setHovered] = useState<{ i: number; s: number } | null>(null);
    const [comments, setComments] = useState('');
    const [formations, setFormations] = useState<string[]>(['']);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const empScoresStr = localStorage.getItem(`eval_scores_${member.user.id_usercount}`);
            if (empScoresStr) {
                try {
                    setEmployeeScores(JSON.parse(empScoresStr));
                } catch (e) { console.error(e); }
            }
        }
    }, [member.user.id_usercount]);

    const realKpis = getEmployeeKpis(member.user.id_usercount);
    const kpis = realKpis
        ? realKpis.map(k => ({ desc: k.desc || k.name || '(Objectif sans titre)', measure: k.measure || 'Non défini' }))
        : MOCK_KPIS.slice(0, member.kpisCount).map(name => ({ desc: name, measure: 'Critère de mesure standard' }));

    const avg = Object.values(scores).length > 0
        ? (Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)
        : '—';

    if (submitted) return (
        <ModalShell title="Évaluation soumise" member={member} accent="#F26322" onClose={onClose}>
            <div className="p-8 flex flex-col items-center gap-5 py-14">
                <div className="w-20 h-20 bg-[#F26322] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle size={40} className="text-white" />
                </div>
                <h4 className="text-xl font-black text-[#463738]">Évaluation enregistrée !</h4>
                <p className="text-sm text-[#A39D98] text-center max-w-sm">
                    L&apos;évaluation de <strong className="text-[#463738]">{member.user.nom_prenoms}</strong> a été soumise et le dossier est en attente de calibration N+2.
                </p>
                <div className="bg-[#E9EBE2] border border-[#d1d6bc] rounded-xl px-8 py-4 text-center">
                    <p className="text-xs font-bold text-[#9A9750] uppercase tracking-wider mb-1">Note finale Manager</p>
                    <p className="text-3xl font-black text-[#F26322]">{avg}/4</p>
                </div>
                <button onClick={onClose} className="mt-2 px-8 py-3 bg-[#463738] text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">Fermer</button>
            </div>
        </ModalShell>
    );

    const { currentUser } = useUser();

    const handlePrintDraft = () => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('eval_period') : null;
        const period = raw ? JSON.parse(raw) : null;
        printEvaluationForm({
            employeeName: member.user.nom_prenoms,
            employeeId: member.user.usercount,
            fonction: member.user.fonction,
            departement: member.user.departement,
            site: member.user.site,
            pays: member.user.pays,
            managerN1Name: currentUser?.nom_prenoms,
            kpis: kpis.map((k, i) => ({
                name: realKpis?.[i]?.name || `Objectif ${i + 1}`,
                desc: k.desc,
                measure: k.measure,
            })),
            evalScores: scores,
            campaignLabel: period?.label,
        }, 'evaluation');
    };

    return (
        <ModalShell title="Évaluation du Manager" member={member} accent="#F26322" onClose={onClose} wide>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[68vh]">
                {/* Auto-évaluation employé (lecture seule) */}
                <div>
                    <div className="bg-[#2B5C3F] text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-t-lg">
                        Auto-évaluation de l&apos;employé (lecture seule)
                    </div>
                    <div className="border border-[#E3E1DB] rounded-b-lg overflow-hidden">
                        <table className="w-full text-[12px]">
                            <thead className="bg-[#f6f5f3] text-[#A39D98] font-bold border-b border-[#E3E1DB]">
                                <tr>
                                    <th className="px-4 py-2.5 text-center border-r border-white/20">OBJECTIFS</th>
                                    <th className="px-4 py-2.5 text-left border-r border-white/20">DESCRIPTION DE L'OBJECTIF (KPI)</th>
                                    <th className="px-4 py-2.5 text-left border-r border-white/20">MESURE</th>
                                    <th className="px-4 py-2.5 text-center border-r border-white/20">ÉCHÉANCE</th>
                                    <th className="px-4 py-2.5 text-center border-r border-white/20">ÉVALUATION</th>
                                    <th className="px-4 py-2.5 text-center border-r border-white/20">LIVRABLES</th>
                                    <th className="px-4 py-2.5 text-center">COMMENTAIRES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E3E1DB]">
                                {kpis.map((kpi, i) => {
                                    const score = employeeScores[realKpis ? (realKpis[i] as any)?.id : i + 1] || 0;
                                    return (
                                        <tr key={i} className="bg-white">
                                            <td className="px-4 py-3 font-bold text-center border-r border-[#E3E1DB]">{realKpis && realKpis[i].name ? realKpis[i].name : `Objectif ${i + 1}`}</td>
                                            <td className="px-4 py-3 text-[#463738] border-r border-[#E3E1DB]">{kpi.desc}</td>
                                            <td className="px-4 py-3 text-[#463738] border-r border-[#E3E1DB]">{kpi.measure}</td>
                                            <td className="px-4 py-3 text-center text-[#463738] font-medium border-r border-[#E3E1DB]">31/12/2026</td>
                                            <td className="px-4 py-3 border-r border-[#E3E1DB]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex gap-1 justify-center">
                                                        {[1, 2, 3, 4].map(s => <Star key={s} size={14} fill={s <= score ? '#F26322' : 'none'} className={s <= score ? 'text-[#F26322]' : 'text-slate-200'} />)}
                                                    </div>
                                                    <p className="text-[10px] text-center font-bold text-[#F26322]">
                                                        {score === 1 ? 'Faible' : score === 2 ? 'Passable' : score === 3 ? 'Bon' : score === 4 ? 'Excellent' : '—'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-[#E3E1DB] text-[10px] text-center text-[#A39D98]">Livrables soumis &gt;&gt;</td>
                                            <td className="px-4 py-3 text-[10px] text-center text-[#A39D98]">Commentaires &gt;&gt;</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="bg-[#EBEAE5] px-6 py-4 flex justify-between items-center border-t border-[#A39D98]/30">
                            <div>
                                <div className="text-[12px] text-[#A39D98] font-bold">Note moyenne</div>
                                <div className="text-[24px] font-black text-[#F26322] flex items-center gap-1 mt-1">
                                    {Object.values(employeeScores).length > 0
                                        ? (Object.values(employeeScores).reduce((a, b) => a + b, 0) / Object.values(employeeScores).length).toFixed(1)
                                        : '0.0'}/4 <Star size={20} fill="#F26322" />
                                </div>
                            </div>
                            <div className="text-right text-[#A39D98]">
                                <div className="text-[12px] font-bold">Objectifs évalués</div>
                                <div className="font-black text-[18px] text-[#463738] mt-1">{Object.keys(employeeScores).length}/{kpis.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Évaluation manager */}
                <div>
                    <div className="bg-[#F26322] text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-t-lg">
                        Votre évaluation (N+1)
                    </div>
                    <div className="border border-[#F26322] rounded-b-lg overflow-hidden">
                        <table className="w-full text-[12px]">
                            <thead className="bg-[#fff7f3] text-[#A39D98] font-bold border-b border-[#fcd9c4]">
                                <tr>
                                    <th className="px-3 py-3 text-center border-r border-white/20">OBJECTIFS</th>
                                    <th className="px-3 py-3 text-center border-r border-white/20">DESCRIPTION DE L'OBJECTIF (KPI)</th>
                                    <th className="px-3 py-3 text-center border-r border-white/20">MESURE</th>
                                    <th className="px-3 py-3 text-center border-r border-white/20">ÉCHÉANCE</th>
                                    <th className="px-3 py-3 text-center border-r border-white/20">ÉVALUATION</th>
                                    <th className="px-3 py-3 text-center border-r border-white/20">LIVRABLES</th>
                                    <th className="px-3 py-3 text-center">COMMENTAIRES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E3E1DB] text-[#463738]">
                                {kpis.map((kpi, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top font-bold text-center">{realKpis && realKpis[i].name ? realKpis[i].name : `Objectif ${i + 1}`}</td>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top">{kpi.desc}</td>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top text-[#7a863b]">{kpi.measure}</td>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top text-center font-bold">31/12/2026</td>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex justify-center gap-1.5 cursor-pointer">
                                                    {[1, 2, 3, 4].map(s => {
                                                        const filled = (scores[i] || 0) >= s || (hovered?.i === i && hovered.s >= s);
                                                        return (
                                                            <Star key={s} size={18}
                                                                fill={filled ? '#F26322' : 'none'}
                                                                className={`cursor-pointer transition-transform hover:scale-125 ${filled ? 'text-[#F26322]' : 'text-slate-200'}`}
                                                                onMouseEnter={() => setHovered({ i, s })}
                                                                onMouseLeave={() => setHovered(null)}
                                                                onClick={() => setScores(p => ({ ...p, [i]: s }))}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] text-center font-bold text-[#F26322] h-4 uppercase">
                                                    {hovered?.i === i ? STAR_LABELS[hovered.s] : scores[i] ? STAR_LABELS[scores[i]] : '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 border-r border-[#E3E1DB] align-top">
                                            <textarea className="w-full border border-[#d1d1d1] rounded p-2 text-[11px] resize-none h-[70px] outline-none focus:border-[#F26322]" placeholder="Livrables attendus ou réalisés.."></textarea>
                                        </td>
                                        <td className="px-3 py-4 align-top">
                                            <textarea className="w-full border border-[#d1d1d1] rounded p-2 text-[11px] resize-none h-[70px] outline-none focus:border-[#F26322]" placeholder="Vos commentaires..."></textarea>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="bg-[#EBEAE5] px-6 py-4 flex justify-center items-center border-t border-[#A39D98]/30">
                            <div className="text-center">
                                <div className="text-[12px] text-[#A39D98] font-bold">Note moyenne Manager</div>
                                <div className="text-[28px] font-black text-[#F26322] flex items-center justify-center gap-1 mt-1">{avg}/4 <Star size={24} fill="#F26322" /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#E3E1DB] rounded-xl p-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#F26322] mb-2"><MessageSquare size={15} /> Commentaires Manager</label>
                        <textarea value={comments} onChange={e => setComments(e.target.value)}
                            className="w-full border border-[#d1d1d1] rounded-lg p-3 text-[13px] outline-none focus:border-[#F26322] h-24 resize-none"
                            placeholder="Votre évaluation globale…" />
                    </div>
                    <div className="bg-white border border-[#E3E1DB] rounded-xl p-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-[#9A9750] mb-2"><Plus size={15} /> Besoins en Formation</label>
                        {formations.map((f, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input value={f} onChange={e => setFormations(fr => { const n = [...fr]; n[i] = e.target.value; return n; })}
                                    className="flex-1 border border-[#d1d1d1] rounded px-3 py-2 text-[13px] outline-none focus:border-[#9A9750]"
                                    placeholder={`Formation ${i + 1}`} />
                                {formations.length > 1 && (
                                    <button onClick={() => setFormations(fr => fr.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setFormations(f => [...f, ''])} className="text-xs font-bold text-[#9A9750] flex items-center gap-1 hover:underline mt-1">
                            <Plus size={12} /> Ajouter une formation
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f6f5f3] border-t border-[#E3E1DB] px-6 py-4 flex justify-between items-center gap-3">
                <button onClick={onClose} className="px-4 py-2.5 border border-[#A39D98]/40 text-[#463738] rounded-lg font-bold text-sm hover:bg-slate-50">Annuler</button>
                <div className="flex gap-3">
                    <button onClick={handlePrintDraft} className="px-5 py-2.5 border border-[#9A9750] text-[#9A9750] rounded-lg font-bold text-sm hover:bg-[#E9EBE2] transition-colors flex items-center gap-2">
                        <Download size={15} /> Imprimer
                    </button>
                    <button
                        onClick={() => {
                            if (Object.keys(scores).length > 0) {
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem(`n1_eval_scores_${member.user.id_usercount}`, JSON.stringify(scores));
                                    localStorage.setItem(`n1_eval_comments_${member.user.id_usercount}`, comments);
                                    localStorage.setItem(`n1_eval_submitted_${member.user.id_usercount}`, 'true');
                                    addNotification(member.user.id_usercount, "Votre évaluation N+1 a été soumise pour calibration.", "info", "/employee");
                                }
                                setSubmitted(true);
                            }
                        }}
                        disabled={Object.keys(scores).length === 0}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${Object.keys(scores).length > 0 ? 'bg-[#F26322] text-white hover:bg-orange-600' : 'bg-[#E3E1DB] text-[#A39D98] cursor-not-allowed'}`}
                    >
                        <Send size={15} /> Soumettre l&apos;évaluation
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── Modale : Voir l'évaluation clôturée ─────────────────────────────────────
function ModalVoirEval({ member, onClose }: { member: TeamMember; onClose: () => void }) {
    const [realScores, setRealScores] = useState<Record<number, number>>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`n1_eval_scores_${member.user.id_usercount}`);
            if (saved) {
                try {
                    setRealScores(JSON.parse(saved));
                } catch (e) { console.error(e); }
            }
        }
    }, [member.user.id_usercount]);

    const realKpis = getEmployeeKpis(member.user.id_usercount);
    const kpisData = realKpis
        ? realKpis.map((rk, i) => ({
            title: rk.name || `Objectif ${i + 1}`,
            desc: rk.desc || rk.name || 'Sans description',
            score: realScores[(rk as any).id] || realScores[i] || 0
        }))
        : MOCK_KPIS.slice(0, member.kpisCount).map((name, i) => ({
            title: `Objectif ${i + 1}`,
            desc: name,
            score: realScores[i] || (i % 4) + 1
        }));

    const avg = kpisData.length > 0
        ? (kpisData.reduce((acc, k) => acc + k.score, 0) / kpisData.length).toFixed(1)
        : '0.0';

    const { currentUser } = useUser();

    const handleDownloadPDF = () => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('eval_period') : null;
        const period = raw ? JSON.parse(raw) : null;
        printEvaluationForm({
            employeeName: member.user.nom_prenoms,
            employeeId: String(member.user.id_usercount),
            fonction: (member.user as any).fonction ?? '—',
            departement: (member.user as any).departement ?? '—',
            site: member.user.site,
            pays: member.user.pays,
            managerN1Name: currentUser?.nom_prenoms,
            kpis: kpisData.map(k => ({ name: k.title, desc: k.desc })),
            evalScores: Object.fromEntries(kpisData.map((k, i) => [i, k.score])),
            campaignLabel: period?.label,
        }, 'evaluation');
    };

    return (
        <ModalShell title="Évaluation Clôturée" member={member} accent="#9A9750" onClose={onClose} wide>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <ShieldCheck size={22} className="text-[#9A9750] shrink-0" />
                    <div>
                        <p className="font-bold text-[#463738] text-sm">Dossier clôturé — Placement 9-Box verrouillé</p>
                        <p className="text-xs text-[#A39D98]">Ce dossier est en lecture seule. Note finale validée par la calibration N+2.</p>
                    </div>
                </div>

                <div className="border border-[#E3E1DB] rounded-xl overflow-hidden">
                    <table className="w-full text-[12px]">
                        <thead className="bg-[#2B5C3F] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Objectif</th>
                                <th className="px-4 py-3 text-left">Description (KPI)</th>
                                <th className="px-4 py-3 text-center w-32">Note</th>
                                <th className="px-4 py-3 text-center w-24">Résultat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3E1DB]">
                            {kpisData.map((k, i) => (
                                <tr key={i} className="bg-white hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-[#463738]">{k.title}</td>
                                    <td className="px-4 py-3 text-[#463738]">{k.desc}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-center">
                                            {[1, 2, 3, 4].map(s => <Star key={s} size={14} fill={s <= k.score ? '#F26322' : 'none'} className={s <= k.score ? 'text-[#F26322]' : 'text-slate-200'} />)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.score >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {STAR_LABELS[k.score] || '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="bg-[#E9EBE2] border-t border-[#d1d6bc] px-6 py-3 flex justify-between">
                        <span className="font-bold text-sm text-[#9A9750]">Note moyenne finale</span>
                        <span className="text-xl font-black text-[#F26322] flex items-center gap-1">{avg}/4 <Star size={16} fill="#F26322" className="text-[#F26322]" /></span>
                    </div>
                </div>
            </div>
            <div className="bg-[#f6f5f3] border-t border-[#E3E1DB] px-6 py-4 flex justify-end gap-3">
                <button onClick={handleDownloadPDF} className="px-5 py-2.5 bg-white border border-[#9A9750] text-[#9A9750] rounded-lg font-bold text-sm hover:bg-[#9A9750] hover:text-white transition-all flex items-center gap-2">
                    <Download size={15} /> Télécharger PDF
                </button>
                <button onClick={onClose} className="px-5 py-2.5 bg-[#463738] text-white rounded-lg font-bold text-sm hover:bg-gray-800">Fermer</button>
            </div>
        </ModalShell>
    );
}

// ─── Modale : Upload Signatures PDF ──────────────────────────────────────────
function ModalSignatures({ member, onClose }: { member: TeamMember; onClose: () => void }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    const simulate = () => {
        setStatus('loading');
        setTimeout(() => setStatus('done'), 1800);
    };

    return (
        <ModalShell title="Soumission Phygitale — Signatures" member={member} accent="#463738" onClose={onClose}>
            <div className="p-6 space-y-5">
                {status !== 'done' ? (
                    <>
                        <div className="text-center mb-2">
                            <div className="w-16 h-16 bg-[#F26322]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UploadCloud size={28} className="text-[#F26322]" />
                            </div>
                            <h4 className="font-bold text-[#463738] text-lg">Upload du document signé</h4>
                            <p className="text-sm text-[#A39D98] mt-1">Concerne : <span className="font-bold text-[#463738]">{member.user.nom_prenoms}</span></p>
                        </div>

                        <div className="border-2 border-dashed border-[#A39D98]/40 rounded-xl p-8 text-center bg-[#E3E1DB]/20 hover:bg-[#F26322]/5 hover:border-[#F26322] transition-colors cursor-pointer group">
                            <FileText size={32} className="mx-auto text-[#A39D98] group-hover:text-[#F26322] mb-2 transition-colors" />
                            <p className="text-sm font-bold text-[#463738]">Cliquez pour sélectionner le PDF scanné</p>
                            <p className="text-xs text-[#A39D98] mt-1 mb-3">Les deux signatures manuscrites (Manager + Employé) doivent figurer sur la dernière page.</p>
                            <span className="text-[11px] font-bold text-[#F26322] bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-200">
                                * Soumis à validation OCR Antigravity
                            </span>
                        </div>

                        <button
                            onClick={status === 'idle' ? simulate : undefined}
                            disabled={status === 'loading'}
                            className="w-full bg-[#F26322] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg transition-all flex justify-center items-center gap-2"
                        >
                            {status === 'loading' ? (
                                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyse OCR en cours...</>
                            ) : (
                                <><Upload size={18} /> Valider l&apos;Upload et Notifier RH</>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-10 gap-4">
                        <div className="w-16 h-16 bg-[#9A9750] rounded-full flex items-center justify-center">
                            <CheckSquare size={30} className="text-white" />
                        </div>
                        <h4 className="text-lg font-black text-[#463738]">Document Conforme &amp; Transmis !</h4>
                        <p className="text-sm text-[#A39D98] text-center max-w-xs">Le PDF a été validé par l&apos;OCR et transmis aux RH. Le dossier est désormais archivé.</p>
                        <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-[#463738] text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">Fermer</button>
                    </div>
                )}
            </div>
        </ModalShell>
    );
}

// ─── Shell commun des modales ─────────────────────────────────────────────────
function ModalShell({
    title, member, accent, onClose, children, wide
}: {
    title: string; member: TeamMember; accent: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#463738]/50 p-4 animate-in fade-in duration-200 overflow-y-auto">
            <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 my-auto`}>
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: accent }}>
                    <div className="flex items-center gap-3">
                        <UserAvatar nom={member.user.nom_prenoms} size={42} textClassName="text-sm font-black" useContextPhoto={false} />
                        <div>
                            <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">{title}</p>
                            <h3 className="text-white font-black text-[16px]">{member.user.nom_prenoms}</h3>
                            <p className="text-white/70 text-[12px]">{member.user.fonction}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Icône Upload (non importée depuis lucide directement) ────────────────────
function Upload({ size, className }: { size: number; className?: string }) {
    return <UploadCloud size={size} className={className} />;
}

// ─── Composant Principal ──────────────────────────────────────────────────────
type TeamTab = 'OBJECTIVES' | 'EVALUATION' | 'REPORTS';
type ActiveModal = { type: 'review' | 'eval' | 'view' | 'sign'; member: TeamMember } | null;

interface MyTeamMockupProps {
    /** Optionnel : permet au parent de récupérer le membre sélectionné pour Évaluer */
    onEvaluateMember?: (m: { id: string; name: string; role: string; step: string; kpisCount: number; pdfUploaded: boolean; avatar: string }) => void;
    /** Optionnel : permet au parent de gérer l'upload */
    onUploadMember?: (name: string) => void;
}

export function MyTeamMockup({ onEvaluateMember, onUploadMember }: MyTeamMockupProps = {}) {
    const { currentUser, addNotification } = useUser();
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [activeTab, setActiveTab] = useState<TeamTab | null>(null);

    const isObjectiveTab = activeTab === 'OBJECTIVES';
    const isEvaluationTab = activeTab === 'EVALUATION';
    const isReportsTab = activeTab === 'REPORTS';

    const teamMembers: TeamMember[] = (
        currentUser ? ALL_USERS.filter(u => u.id_evaluateur === currentUser.id_usercount) : []
    ).map(u => {
        const realKpis = getEmployeeKpis(u.id_usercount);
        return {
            user: u,
            step: getStep(u.id_usercount),
            kpisCount: realKpis ? realKpis.length : (u.id_usercount % 3) + 2,
            pdfUploaded: u.id_usercount % 5 === 0,
        };
    });

    const clotures = teamMembers.filter(m => m.step === 'COMPLETED').length;
    const aEvaluer = teamMembers.filter(m => m.step === 'SELF_EVAL_DONE').length;
    const enAttente = teamMembers.filter(m => m.step === 'KPI_SUBMITTED').length;
    const pct = teamMembers.length > 0 ? Math.round((clotures / teamMembers.length) * 100) : 0;

    // Données pour les statistiques
    const kpiStats = [
        { name: 'KPIs Soumis', value: teamMembers.filter(m => m.step !== 'PENDING').length, color: '#9A9750' },
        { name: 'En attente', value: teamMembers.filter(m => m.step === 'PENDING').length, color: '#E3E1DB' }
    ];

    const evalStats = [
        { name: 'Auto-éval effectuée', value: teamMembers.filter(m => m.step === 'SELF_EVAL_DONE' || m.step === 'COMPLETED').length },
        { name: 'En attente', value: teamMembers.filter(m => m.step === 'PENDING' || m.step === 'KPI_SUBMITTED').length }
    ];

    const evalChartData = [
        { status: 'Auto-évaluations', Effectué: evalStats[0].value, Attente: evalStats[1].value }
    ];

    // Gradients pour les boutons (inspiré de l'Espace Collaborateur)
    const gradients = {
        objectives: 'linear-gradient(to right, #8e8584, #4a3f3d)',
        evaluation: 'linear-gradient(to right, #b3b97b, #8f917b)',
        reports: 'linear-gradient(to right, #50443b, #9e9e5e)'
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">

            {/* Breadcrumb Navigation (Style Espace Collaborateur) */}
            <div className="bg-white -mx-8 -mt-6 px-8 py-3 flex items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0 mb-6">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors" onClick={() => setActiveTab(null)}>
                        <Home size={15} className="mb-0.5" /> 🏠 Pilotage de la Performance
                    </span>
                    {activeTab && (
                        <>
                            <ChevronRight size={14} />
                            <span className="text-[#463738]">
                                {activeTab === 'OBJECTIVES' && 'Objectifs de l\'équipe'}
                                {activeTab === 'EVALUATION' && 'Évaluer l\'équipe'}
                                {activeTab === 'REPORTS' && 'Rapports & Statistiques'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Modales */}
            {activeModal?.type === 'review' && <ModalReviewKpis member={activeModal.member} onClose={() => setActiveModal(null)} addNotification={addNotification} />}
            {activeModal?.type === 'eval' && <ModalEvaluer member={activeModal.member} onClose={() => setActiveModal(null)} addNotification={addNotification} />}
            {activeModal?.type === 'view' && <ModalVoirEval member={activeModal.member} onClose={() => setActiveModal(null)} />}
            {activeModal?.type === 'sign' && <ModalSignatures member={activeModal.member} onClose={() => setActiveModal(null)} />}

            {/* Title Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-[28px] font-bold text-[#463738] mb-1">
                        {activeTab === 'OBJECTIVES' && 'Objectifs de l\'équipe'}
                        {activeTab === 'EVALUATION' && 'Évaluation de l\'équipe'}
                        {activeTab === 'REPORTS' && 'Analyses & Statistiques'}
                        {!activeTab && 'Pilotage de la Performance (Équipe)'}
                    </h2>
                    <p className="text-[#A39D98] text-[15px]">
                        {!activeTab && 'Suivez et évaluez vos subordonnés directs via les workflows métier.'}
                        {activeTab === 'OBJECTIVES' && 'Consultez, modifiez et validez les KPIs soumis par vos collaborateurs.'}
                        {activeTab === 'EVALUATION' && 'Réalisez l\'évaluation annuelle de la performance de vos collaborateurs.'}
                        {activeTab === 'REPORTS' && 'Visualisez l\'état d\'avancement global et la distribution de la performance.'}
                    </p>
                </div>
                {!activeTab && teamMembers.length > 0 && (
                    <div className="flex gap-2 shrink-0">
                        {[
                            { label: 'À Évaluer', val: aEvaluer, color: 'bg-orange-50 text-[#F26322] border-orange-100' },
                            { label: 'Collectés', val: enAttente, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                            { label: 'Clôturés', val: clotures, color: 'bg-emerald-50 text-[#9A9750] border-emerald-100' },
                        ].map(({ label, val, color }) => (
                            <div key={label} className={`border rounded-xl px-3 py-1.5 text-center min-w-[80px] ${color}`}>
                                <p className="text-xl font-black">{val}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Switching Logic */}
            {!activeTab ? (
                /* Mode ACCUEIL : Actions principales Navigation Grid (Style Espace Collaborateur) */
                <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-[#F26322] font-black text-lg mb-4 flex items-center gap-2">
                        <Users size={20} /> Actions principales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => setActiveTab('OBJECTIVES')}
                            className="p-8 rounded-xl font-black text-[18px] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg hover:shadow-2xl group"
                            style={{ background: gradients.objectives, color: 'white' }}
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target size={36} />
                            </div>
                            Objectifs de l&apos;équipe
                        </button>
                        <button
                            onClick={() => setActiveTab('EVALUATION')}
                            className="p-8 rounded-xl font-black text-[18px] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg hover:shadow-2xl group"
                            style={{ background: gradients.evaluation, color: 'white' }}
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award size={36} />
                            </div>
                            Évaluer l&apos;équipe
                        </button>
                        <button
                            onClick={() => setActiveTab('REPORTS')}
                            className="p-8 rounded-xl font-black text-[18px] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 shadow-lg hover:shadow-2xl group"
                            style={{ background: gradients.reports, color: 'white' }}
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 size={36} />
                            </div>
                            Rapports &amp; Statistiques
                        </button>
                    </div>
                </div>
            ) : isReportsTab ? (
                /* VUE RAPPORTS */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="flex justify-end">
                        <button onClick={() => setActiveTab(null)} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#463738] text-[#463738] rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-md">
                            <Home size={18} /> Retour Menu Principal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#A39D98]/20 shadow-sm">
                            <h4 className="font-black text-[#463738] text-[15px] uppercase tracking-wider mb-6">État des Objectifs (KPIs)</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={kpiStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {kpiStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#A39D98]/20 shadow-sm">
                            <h4 className="font-black text-[#463738] text-[15px] uppercase tracking-wider mb-6">Auto-évaluations réalisées</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={evalChartData} layout="vertical" barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="status" hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Legend />
                                        <Bar dataKey="Effectué" stackId="a" fill="#F26322" />
                                        <Bar dataKey="Attente" stackId="a" fill="#E3E1DB" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-[#463738] p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <TrendingUp size={120} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-black mb-1 text-[#9A9750]">Vision Globale de Performance</h4>
                                <p className="text-white/60 text-sm">Taux d&apos;engagement actuel de l&apos;équipe sur ce cycle.</p>
                            </div>
                            <div className="relative z-10 flex gap-10">
                                <div className="text-center">
                                    <p className="text-4xl font-black">{pct}%</p>
                                    <p className="text-[10px] uppercase font-bold text-white/40">Participation</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-black">{teamMembers.length - clotures}</p>
                                    <p className="text-[10px] uppercase font-bold text-white/40">À Clôturer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* VUE LISTE COLLABORATEURS (OBJECTIVES OU EVALUATION) */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-[#463738]">
                            Collaborateurs rattachés ({teamMembers.length})
                        </h3>
                        <button onClick={() => setActiveTab(null)} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#463738] text-[#463738] rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-md">
                            <Home size={18} /> Retour Menu Principal
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {teamMembers.map(m => {
                            const { user, step, kpisCount, pdfUploaded } = m;
                            const progressVal = progress(step);
                            return (
                                <div key={user.id_usercount} className={`bg-white rounded-2xl shadow-sm border border-[#A39D98]/25 overflow-hidden flex flex-col md:flex-row items-stretch border-l-8 ${borderColor(step)} hover:shadow-xl transition-all`}>
                                    <div className="p-6 md:w-[32%] flex items-center border-b md:border-b-0 md:border-r border-[#A39D98]/15 bg-slate-50/20">
                                        <div className="flex gap-4 items-center">
                                            <UserAvatar nom={user.nom_prenoms} size={54} className="shadow-sm" />
                                            <div>
                                                <h4 className="font-black text-[#463738] text-[15px] leading-tight">{user.nom_prenoms}</h4>
                                                <p className="text-[10px] font-black text-[#A39D98] uppercase tracking-wider mt-0.5">{user.fonction}</p>
                                                <div className="mt-2 flex items-center gap-1.5">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor(step)}`} />
                                                    <span className="text-[10px] font-bold text-[#625953] uppercase">{step === 'COMPLETED' ? 'Clôturé' : 'En cours'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-black text-[#A39D98] uppercase tracking-wider">Avancement Workflow</span>
                                            <span className="text-[14px] font-black text-[#463738]">{isObjectiveTab ? (step === 'PENDING' ? '0%' : '100%') : progressVal}%</span>
                                        </div>
                                        <div className="w-full bg-[#E3E1DB]/40 h-2.5 rounded-full overflow-hidden mb-4 border border-black/5">
                                            <div className={`h-full transition-all duration-1000 ${isObjectiveTab ? (step === 'PENDING' ? 'bg-slate-200' : 'bg-[#9A9750]') : barColor(step)}`} style={{ width: `${isObjectiveTab ? (step === 'PENDING' ? 5 : 100) : progressVal}%` }} />
                                        </div>
                                        <StatusBadge step={step} isObjectiveTab={isObjectiveTab} />
                                    </div>

                                    <div className="p-6 md:w-[22%] flex items-center justify-center bg-slate-50/10">
                                        {isObjectiveTab ? (
                                            <div className="flex flex-col gap-2 w-full">
                                                {step === 'KPI_SUBMITTED' || step === 'PENDING' ? (
                                                    <button onClick={() => setActiveModal({ type: 'review', member: m })} className="w-full bg-[#463738] text-white py-3 rounded-lg font-black text-[13px] hover:bg-black transition-all shadow-md flex items-center justify-center gap-2">
                                                        <Edit3 size={15} /> Edit / Valider
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setActiveModal({ type: 'review', member: m })} className="w-full bg-white text-[#463738] border-2 border-[#463738] py-3 rounded-lg font-black text-[13px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                                        <Search size={15} /> Consulter
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 w-full">
                                                {step === 'SELF_EVAL_DONE' ? (
                                                    <button
                                                        onClick={() => {
                                                            if (onEvaluateMember) {
                                                                onEvaluateMember({ id: String(user.id_usercount), name: user.nom_prenoms, role: user.fonction, step, kpisCount, pdfUploaded, avatar: '' });
                                                            } else {
                                                                setActiveModal({ type: 'eval', member: m });
                                                            }
                                                        }}
                                                        className="w-full bg-[#F26322] text-white py-3 rounded-lg font-black text-[13px] hover:bg-[#e0561a] transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <Award size={15} /> Évaluer
                                                    </button>
                                                ) : step === 'COMPLETED' ? (
                                                    <button onClick={() => setActiveModal({ type: 'view', member: m })} className="w-full bg-[#9A9750] text-white py-3 rounded-lg font-black text-[13px] hover:bg-[#858245] transition-all shadow-md flex items-center justify-center gap-2">
                                                        <FileText size={15} /> Voir Dossier
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#f3f2ef] border border-black/5 rounded-lg text-[11px] font-black text-[#A39D98] uppercase">
                                                        <Lock size={14} /> En attente
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Barre de synthèse finale */}
                    <div className="bg-[#463738] p-6 rounded-2xl flex justify-between items-center text-white shadow-xl mt-8">
                        <div>
                            <p className="font-black text-lg mb-1">Résumé Global — {isObjectiveTab ? 'Objectifs' : 'Évaluations'}</p>
                            <p className="text-white/50 text-xs italic tracking-wide">
                                {clotures} dossiers finalisés sur un total de {teamMembers.length} collaborateurs.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-2xl font-black text-[#9A9750]">{pct}%</span>
                            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="bg-[#9A9750] h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(154,151,80,0.4)]" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Aucun membre */}
            {teamMembers.length === 0 && (
                <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-[#A39D98]/20 shadow-inner">
                    <UserX size={64} className="mx-auto text-[#A39D98]/40 mb-6" />
                    <h3 className="text-xl font-black text-[#463738] mb-2">Aucun collaborateur</h3>
                    <p className="text-[#A39D98] font-bold">Votre équipe est actuellement vide pour ce cycle.</p>
                </div>
            )}
        </div>
    );
}

// ─── Composants Internes (Statuts) ──────────────────────────────────────────

type Step = WorkflowStep;

function StatusBadge({ step, isObjectiveTab }: { step: Step; isObjectiveTab: boolean }) {
    if (step === 'PENDING') return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            <Clock size={14} /> En attente de soumission
        </div>
    );
    if (step === 'KPI_SUBMITTED') return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700 font-bold uppercase tracking-wider">
            <AlertTriangle size={14} className="text-amber-500" />
            {isObjectiveTab ? 'Objectifs reçus : À valider' : 'Validation N+1 requise'}
        </div>
    );
    if (step === 'SELF_EVAL_DONE') return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-[#F26322]/30 rounded-lg text-[11px] text-[#F26322] font-black uppercase tracking-wider">
            <UserCheck size={14} />
            {isObjectiveTab ? 'Objectifs validés' : 'Auto-évaluation terminée : À noter'}
        </div>
    );
    if (step === 'N1_EVAL_DONE') return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-700 font-black uppercase tracking-wider">
            <Clock size={14} /> En attente de validation N+2
        </div>
    );
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-[#9A9750]/30 rounded-lg text-[11px] text-[#9A9750] font-black uppercase tracking-wider">
            <ShieldCheck size={14} /> Évaluation clôturée
        </div>
    );
}
