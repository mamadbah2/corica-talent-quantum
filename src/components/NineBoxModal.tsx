"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, X, ChevronRight, ChevronDown, CheckCircle, Palette, Save } from 'lucide-react';
import {
    Employee,
    getMatrixCategory,
    MATRIX_CELLS,
    POTENTIAL_QUESTIONS
} from '@/lib/data';
import { useUser } from '@/context/UserContext';

interface NineBoxModalProps {
    onClose: () => void;
}

export function NineBoxModal({ onClose }: NineBoxModalProps) {
    const [activeTab, setActiveTab] = useState<'eval' | 'dash' | 'hist'>('dash');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingParams, setLoadingParams] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Evaluation Form State
    const [evalProgress, setEvalProgress] = useState(0);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [perfScore, setPerfScore] = useState('');
    const [answers, setAnswers] = useState<Record<number, number>>({});

    const { currentUser } = useUser();

    useEffect(() => {
        if (!currentUser) return;

        Promise.all([
            fetch(`/api/employees?managerId=${currentUser.id_usercount}`).then(r => r.json()),
            fetch('/api/history').then(r => r.json())
        ]).then(([empData, histData]) => {
            setEmployees(empData);
            setHistory(histData);
            setLoadingParams(false);
        });
    }, [currentUser]);

    const handleSubmit = async () => {
        if (!selectedEmployeeId || !perfScore || evalProgress < 16) return;

        const perf = parseFloat(perfScore) || 0;
        const potArray = Array.from({ length: 16 }, (_, i) => answers[i + 1] || 1);
        const potTotal = potArray.reduce((sum, val) => sum + val, 0);
        const potMean = potTotal / 16;

        // Calculate category with same logic offset
        const category = getMatrixCategory(perf, potMean);

        // Optimistic UI updates
        const emp = employees.find(e => e.id === selectedEmployeeId);
        const roleString = `${emp?.site || ''} | ${emp?.role || ''}`;

        setEmployees(prev => prev.map(e =>
            e.id === selectedEmployeeId ? { ...e, performanceScoreN: perf, potentialAnswers: potArray } : e
        ));

        const newHist = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fr-FR'),
            user: emp?.name || 'Inconnu',
            role: roleString,
            evaluator: 'Ibouraima Djibo',
            category: category
        };
        setHistory(prev => [newHist, ...prev]);

        // Background API calls
        fetch('/api/employees', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedEmployeeId, performanceScoreN: perf, potentialAnswers: potArray })
        });
        fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: emp?.name || 'Inconnu', role: roleString, evaluator: 'Ibouraima Djibo', category: category })
        });

        // Reset and go to dash
        setEvalProgress(0);
        setAnswers({});
        setSelectedEmployeeId('');
        setPerfScore('');
        setActiveTab('dash');
    };

    // Filter State
    const [dashFilters, setDashFilters] = useState<Record<string, string>>({
        department: 'ALL',
        position: 'ALL',
        jobGrade: 'ALL',
        seniority: 'ALL',
        site: 'ALL'
    });

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            if (dashFilters.department !== 'ALL' && e.department !== dashFilters.department) return false;
            if (dashFilters.position !== 'ALL' && e.position !== dashFilters.position) return false;
            if (dashFilters.jobGrade !== 'ALL' && e.jobGrade !== dashFilters.jobGrade) return false;
            if (dashFilters.seniority !== 'ALL' && e.seniority !== dashFilters.seniority) return false;
            if (dashFilters.site !== 'ALL' && e.site !== dashFilters.site) return false;
            return true;
        });
    }, [employees, dashFilters]);

    const filterOptions = useMemo(() => {
        return {
            department: Array.from(new Set(employees.map(e => e.department).filter(Boolean))),
            position: Array.from(new Set(employees.map(e => e.position).filter(Boolean))),
            jobGrade: Array.from(new Set(employees.map(e => e.jobGrade).filter(Boolean))),
            seniority: Array.from(new Set(employees.map(e => e.seniority).filter(Boolean))),
            site: Array.from(new Set(employees.map(e => e.site).filter(Boolean))),
        };
    }, [employees]);

    // Grouped by Total Score Logic (Mock)
    const dashboardStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredEmployees.forEach(e => {
            const potTotal = e.potentialAnswers.reduce((a, b) => a + b, 0);
            const potMean = potTotal / 16;
            const cat = getMatrixCategory(e.performanceScoreN, potMean);
            stats[cat] = (stats[cat] || 0) + 1;
        });
        return stats;
    }, [filteredEmployees]);

    const employeesInSelectedCategory = useMemo(() => {
        if (!selectedCategory) return [];
        return filteredEmployees.filter(e => {
            const potTotal = e.potentialAnswers.reduce((a, b) => a + b, 0);
            const potMean = potTotal / 16;
            return getMatrixCategory(e.performanceScoreN, potMean) === selectedCategory;
        });
    }, [filteredEmployees, selectedCategory]);

    if (loadingParams) {
        return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-t-[#F26322] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_15px_#F26322]"></div>
                    <div className="text-white text-xl font-bold tracking-widest uppercase animate-pulse drop-shadow-lg">Initialisation 9-Box...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div className="w-full max-w-[1300px] h-[95vh] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative bg-gradient-to-b from-white to-[#f5f5f5]">

                {/* Decorative glowing orb behind header */}
                <div className="absolute top-[-100px] left-[50%] -translate-x-1/2 w-[600px] h-[200px] bg-[#F26322]/20 blur-[100px] pointer-events-none z-0" />

                {/* Header Premium */}
                <header className="bg-gradient-to-r from-[#F26322] to-[#e44c0b] px-6 py-5 flex items-center justify-between shrink-0 relative z-10 shadow-md">
                    <div className="flex items-center gap-4 text-white">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-widest drop-shadow-sm">TALENT MATRIX <span className="opacity-70 font-light hidden md:inline">| CORICA GROUP</span></h2>
                            <p className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5 max-w-[500px] leading-tight flex items-center gap-1.5 border border-white/20 bg-white/10 px-2 py-0.5 rounded shadow-sm inline-flex">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Seuls l'évaluateur N+1, N+2 et le Responsable RH concerné ont accès à cet espace.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        <button className="p-2 rounded-full hover:bg-white/20 transition-all active:scale-95"><Settings size={20} /></button>
                        <button className="p-2 rounded-full hover:bg-white/20 hover:rotate-90 transition-all active:scale-95" onClick={onClose}><X size={24} /></button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="bg-white/80 backdrop-blur-md border-b border-[#A39D98]/20 px-6 flex items-center shrink-0 relative z-10 shadow-sm">
                    <button
                        onClick={() => setActiveTab('eval')}
                        className={`py-[18px] px-8 text-[14px] font-semibold flex items-center gap-2 border-b-[3px] transition-colors ${activeTab === 'eval' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98] hover:text-[#463738]'}`}
                    >
                        <span className="text-[17px] opacity-90">◎</span> Nouvelle Évaluation
                    </button>
                    <button
                        onClick={() => setActiveTab('dash')}
                        className={`py-[18px] px-8 text-[14px] font-semibold flex items-center gap-2 border-b-[3px] transition-colors ${activeTab === 'dash' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98] hover:text-[#463738]'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard 9-Box
                    </button>
                    <button
                        onClick={() => setActiveTab('hist')}
                        className={`py-[18px] px-8 text-[14px] font-semibold flex items-center gap-2 border-b-[3px] transition-colors ${activeTab === 'hist' ? 'border-[#F26322] text-[#F26322]' : 'border-transparent text-[#A39D98] hover:text-[#463738]'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Historique ({history.length})
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 modal-content-scroll">

                    {/* EVALUATION TAB */}
                    {activeTab === 'eval' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Section 1 */}
                            <div className="bg-white rounded-xl border border-[#A39D98]/30 p-6 shadow-sm">
                                <h3 className="text-[#463738] font-bold flex items-center gap-2 mb-6">
                                    <span className="text-[#F26322]">💼</span> 1. Informations de l'employé et Performance
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#463738] mb-2">Sélectionner un employé *</label>
                                        <select
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-[#463738] focus:outline-none focus:border-[#F26322]"
                                        >
                                            <option value="">-- Choisir un employé --</option>
                                            {employees.map((e) => (
                                                <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#463738] mb-2">Note Performance Année N (Moyenne 1 à 4) *</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 3.5"
                                            value={perfScore}
                                            onChange={(e) => setPerfScore(e.target.value)}
                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-[#463738] focus:outline-none focus:border-[#F26322]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#463738] mb-2">Note Performance Année N-1 (optionnel)</label>
                                        <input type="text" placeholder="Ex: 3.2" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-[#463738] focus:outline-none focus:border-[#F26322]" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="bg-white rounded-xl border border-[#A39D98]/30 p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#463738] font-bold flex items-center gap-2">
                                        <span className="text-[#F26322]">📈</span> 2. Évaluation du Potentiel (16 critères)
                                    </h3>
                                    <span className="text-sm font-bold text-slate-500">{evalProgress}/16</span>
                                </div>

                                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-8 overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${(evalProgress / 16) * 100}%` }}></div>
                                </div>

                                {[
                                    { title: 'Agilité', count: 7, start: 0, end: 7 },
                                    { title: 'Aspiration', count: 4, start: 7, end: 11 },
                                    { title: 'Motivation & Engagement', count: 5, start: 11, end: 16 }
                                ].map((group, gIdx) => (
                                    <div key={gIdx} className="mb-8">
                                        <h4 className="text-[#9A9750] font-bold flex items-center gap-2 text-sm mb-4">
                                            <span className="w-2 h-2 rounded-full bg-[#9A9750]"></span> {group.title} <span className="text-[#A39D98] font-normal">({group.count} questions)</span>
                                        </h4>

                                        <div className="space-y-4">
                                            {POTENTIAL_QUESTIONS.slice(group.start, group.end).map((q) => (
                                                <div key={q.id} className="border border-slate-200 rounded-lg p-5 hover:border-[#F26322] transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-7 h-7 shrink-0 bg-[#463738] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                            {q.id}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-[#463738] mb-4">{q.text}</p>
                                                            <div className="flex gap-3">
                                                                {['Faible', 'Passable', 'Bon', 'Excellent'].map((btn, btnIdx) => {
                                                                    const score = btnIdx + 1;
                                                                    const isSelected = answers[q.id] === score;
                                                                    return (
                                                                        <button
                                                                            key={btn}
                                                                            onClick={() => {
                                                                                if (!answers[q.id]) setEvalProgress(prev => Math.min(16, prev + 1));
                                                                                setAnswers(prev => ({ ...prev, [q.id]: score }));
                                                                            }}
                                                                            className={`px-4 py-1.5 rounded border text-sm font-semibold transition-colors ${isSelected ? 'bg-white border-[#F26322] text-[#F26322] shadow-[0_0_0_1px_#F26322]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:border-[#F26322] hover:text-[#F26322]'
                                                                                }`}
                                                                        >
                                                                            {btn}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {evalProgress === 16 && selectedEmployeeId && perfScore && (
                                    <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end">
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-[#F26322] hover:bg-[#E35414] text-white px-8 py-3 rounded-md font-bold text-sm shadow-md transition-colors"
                                        >
                                            Sauvegarder l'évaluation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* DASHBOARD 9-BOX TAB */}
                    {activeTab === 'dash' && (
                        <div className="w-full flex-1 bg-[#eff1f4] p-[30px] flex flex-col overflow-hidden">

                            {/* Top Orange Bar & Filters */}
                            <div className="bg-white rounded-[10px] border border-[#A39D98]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden shrink-0">
                                <div className="bg-[#F26322] px-6 py-3.5 flex justify-between items-center text-white">
                                    <span className="font-bold text-[16px] tracking-wide">DASHBOARD</span>
                                    <button
                                        onClick={() => setIsCustomizing(true)}
                                        className="text-[13px] font-semibold border border-white/40 px-3.5 py-1.5 rounded-[4px] hover:bg-white/10 flex items-center gap-2 transition-colors"
                                    >
                                        <Settings size={15} /> Personnaliser
                                    </button>
                                </div>

                                <div className="grid grid-cols-6 gap-0 border border-t-0 border-slate-200 rounded-b-md bg-white">
                                    {[
                                        { label: 'ID', key: 'id' },
                                        { label: 'DEPARTMENT', key: 'department' },
                                        { label: 'POSITION', key: 'position' },
                                        { label: 'JOB GRADE', key: 'jobGrade' },
                                        { label: 'SENIORITY', key: 'seniority' },
                                        { label: 'SITE', key: 'site' }
                                    ].map((f, i) => (
                                        <div key={i} className={`p-3 relative ${i < 5 ? 'border-r border-slate-200' : ''}`}>
                                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{f.label}</span>
                                            {f.key === 'id' ? (
                                                <span className="text-sm font-bold text-[#1f2937] flex justify-between items-center opacity-50 cursor-not-allowed">
                                                    ALL <ChevronDown size={14} className="text-slate-400" />
                                                </span>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        value={dashFilters[f.key]}
                                                        onChange={(e) => setDashFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                        className="w-full text-sm font-bold text-[#1f2937] bg-transparent outline-none appearance-none cursor-pointer pr-6"
                                                    >
                                                        <option value="ALL">ALL</option>
                                                        {filterOptions[f.key as keyof typeof filterOptions].map(opt => (
                                                            <option key={opt as string} value={opt as string}>{opt as React.ReactNode}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Matrix Layout Area */}
                            <div className="mt-6 flex gap-6 flex-1 min-h-[480px]">

                                {/* The Grid Container */}
                                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden min-h-[450px]">
                                    <div className="flex flex-1 relative">
                                        {/* Y Axis Bar */}
                                        <div className="w-[70px] bg-[#221e1e] flex flex-col shrink-0 text-white items-center py-8 relative shadow-inner z-10">
                                            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] -rotate-90 origin-center whitespace-nowrap text-white text-[12px] font-black tracking-[0.2em] opacity-90 w-[200px] text-center pointer-events-none">
                                                PERFORMANCE
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between text-[11px] font-bold tracking-wider relative z-10 w-full mb-4 mt-6 pointer-events-none">
                                                <div className="text-center w-full">HIGH</div>
                                                <div className="text-center w-full">AVERAGE</div>
                                                <div className="text-center w-full">LOW</div>
                                            </div>
                                        </div>

                                        {/* Interactive 3x3 Cells */}
                                        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-[3px] bg-slate-200/50 p-[3px]">
                                            {MATRIX_CELLS.map((cell) => {
                                                const count = dashboardStats[cell.cat] || 0;
                                                const percentage = ((count / (filteredEmployees.length || 1)) * 100).toFixed(1);

                                                // Map standard colors to premium grandients
                                                const gradientMap: Record<string, string> = {
                                                    'bg-[#fbb923]': 'bg-gradient-to-br from-amber-400 to-[#f59e0b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]', // Core, Solid Performer, Potential Gem
                                                    'bg-[#a5a9ad]': 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]', // High Perf, High Pot
                                                    'bg-[#ea5d1f]': 'bg-gradient-to-br from-[#F26322] to-[#dc2626] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]', // Star, Risk
                                                    'bg-[#8ac63f]': 'bg-gradient-to-br from-lime-500 to-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]', // Average Perf, Inconsistent
                                                };
                                                const gradientClass = gradientMap[cell.color] || cell.color;

                                                const isSelected = selectedCategory === cell.cat;

                                                return (
                                                    <div
                                                        key={cell.id}
                                                        onClick={() => setSelectedCategory(isSelected ? null : cell.cat)}
                                                        className={`
                                                            ${gradientClass} p-4 flex flex-col items-center justify-center relative cursor-pointer transition-all duration-300
                                                            hover:brightness-110 hover:shadow-lg
                                                            ${isSelected ? 'ring-[3px] ring-offset-2 ring-[#463738] z-10 scale-[1.02] shadow-2xl' : 'scale-100'}
                                                        `}
                                                    >
                                                        <span className="absolute top-4 left-0 right-0 text-center uppercase font-black text-white/90 text-[10px] sm:text-[11px] tracking-[0.15em] drop-shadow-sm">{cell.title}</span>
                                                        <div className="mt-4 flex flex-col items-center">
                                                            <div className={`
                                                                min-w-[64px] h-[36px] rounded-full flex items-center justify-center font-bold text-[20px] tracking-tight transition-colors duration-300
                                                                ${isSelected ? 'bg-white text-[#463738] shadow-md' : 'bg-black/20 text-white shadow-inner'} px-4
                                                            `}>
                                                                {count}
                                                            </div>
                                                            <div className="mt-2 text-[12px] font-bold text-white/90 tracking-wide drop-shadow-sm">
                                                                {percentage}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* X Axis Bar */}
                                    <div className="h-[46px] bg-[#dadada] flex relative shadow-inner mt-[1px]">
                                        <div className="w-[70px] shrink-0 bg-[#353131]"></div>
                                        <div className="absolute top-full left-0 right-0 text-center text-[12px] font-black uppercase tracking-[0.2em] text-[#333333] pt-2">
                                            POTENTIAL
                                        </div>
                                        <div className="flex-1 flex items-center justify-around text-center text-[11px] font-bold uppercase tracking-wider text-[#333333]">
                                            <div className="flex-1">LOW</div>
                                            <div className="flex-1">AVERAGE</div>
                                            <div className="flex-1">HIGH</div>
                                        </div>
                                    </div>
                                    <div className="h-[40px] bg-[#eff1f4]"></div>
                                </div>

                                {/* Grouped by total score column on right / Detail panel */}
                                <div className="w-[340px] border border-slate-200 rounded-xl bg-white flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden shrink-0 min-h-[450px]">
                                    {selectedCategory ? (
                                        <>
                                            <div className="p-[20px] bg-[#363231] text-white flex flex-col relative shrink-0">
                                                <X size={20} className="absolute top-4 right-4 cursor-pointer text-white/60 hover:text-white transition-colors" onClick={() => setSelectedCategory(null)} />
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className={`w-3 h-3 rounded-[2px] ${MATRIX_CELLS.find(c => c.cat === selectedCategory)?.color || 'bg-white'}`}></div>
                                                    <span className="text-[16px] font-bold tracking-tight">{selectedCategory} ({employeesInSelectedCategory.length})</span>
                                                </div>
                                                <p className="text-[12px] text-white/70 ml-[22px]">Catégorie de performance ciblée.</p>
                                            </div>
                                            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3 custom-scrollbar">
                                                {employeesInSelectedCategory.map(emp => (
                                                    <div key={emp.id} className="p-3 border border-slate-200 bg-white rounded-lg flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                                                            {emp.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-[#1f2937] truncate">{emp.name}</p>
                                                            <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {employeesInSelectedCategory.length === 0 && (
                                                    <p className="text-xs text-slate-500 text-center py-8 bg-white border border-slate-200 rounded-lg border-dashed">Aucun talent pour l'instant.</p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                                <span className="text-[14px] font-bold text-[#1f2937]">Grouped by total score</span>
                                            </div>
                                            <div className="flex-1 bg-white relative flex flex-col justify-center items-center overflow-hidden min-h-[400px]">
                                                {(() => {
                                                    const rawPoints = MATRIX_CELLS.map(cell => {
                                                        const count = dashboardStats[cell.cat] || 0;
                                                        let gradient = 'from-slate-400 to-slate-500';
                                                        if (cell.color.includes('fbb923')) gradient = 'from-[#fcd34d] to-[#d97706]';
                                                        if (cell.color.includes('ea5d1f')) gradient = 'from-[#F26322] to-[#dc2626]';
                                                        if (cell.color.includes('8ac63f')) gradient = 'from-emerald-400 to-emerald-600';
                                                        return { val: count, gradient, cat: cell.cat };
                                                    });
                                                    const W = 340;
                                                    const H = 400;
                                                    const maxVal = Math.max(...rawPoints.map(d => d.val), 12);

                                                    const paddingX = 45;
                                                    const paddingYTop = 60;
                                                    const paddingYBot = 60;
                                                    const stepX = (W - 2 * paddingX) / (rawPoints.length - 1);
                                                    const innerH = H - paddingYTop - paddingYBot;

                                                    const pts = rawPoints.map((d, i) => {
                                                        const x = paddingX + i * stepX;
                                                        const y = H - paddingYBot - (maxVal === 0 ? 0 : (d.val / maxVal) * innerH);
                                                        return { x, y, ...d };
                                                    });

                                                    let pathD = `M ${pts[0].x},${pts[0].y} `;
                                                    for (let i = 1; i < pts.length; i++) {
                                                        const p0 = pts[i - 1];
                                                        const p1 = pts[i];
                                                        const cp1x = p0.x + stepX / 2;
                                                        const cp1y = p0.y;
                                                        const cp2x = p1.x - stepX / 2;
                                                        const cp2y = p1.y;
                                                        pathD += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y} `;
                                                    }

                                                    const gridLines = [0, 1, 2, 3, 4].map(idx => {
                                                        const yLine = H - paddingYBot - (idx / 4) * innerH;
                                                        return <line key={idx} x1={20} y1={yLine} x2={W - 20} y2={yLine} stroke="#e5e7eb" strokeWidth="1" />;
                                                    });

                                                    return (
                                                        <div className="absolute inset-0">
                                                            <svg width={W} height={H} className="absolute top-0 left-0" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }}>
                                                                <rect x="20" y={paddingYTop} width={W - 40} height={innerH} fill="#f9fafb" rx="4" />
                                                                {gridLines}
                                                            </svg>
                                                            {pts.map((p, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`absolute w-[48px] h-[48px] -ml-[24px] -mt-[24px] rounded-full flex items-center justify-center text-[16px] font-black text-white shadow-lg bg-gradient-to-br ${p.gradient} border-[3px] border-white hover:scale-110 transition-transform cursor-pointer z-10 hover:shadow-xl`}
                                                                    style={{ left: p.x, top: p.y }}
                                                                    title={`${p.cat} - Score: ${p.val}`}
                                                                    onClick={() => setSelectedCategory(p.cat!)}
                                                                >
                                                                    {p.val}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HISTORIQUE TAB */}
                    {activeTab === 'hist' && (
                        <div className="max-w-5xl mx-auto space-y-3">
                            {history.map((hist: any, i: number) => {
                                const bgCol = hist.category === 'STAR' || hist.category === 'RISK' ? 'bg-[#ea5d1f]' :
                                    hist.category === 'AVERAGE PERFORMER' || hist.category === 'INCONSISTENT PLAYER' ? 'bg-[#8ac63f]' :
                                        hist.category === 'HIGH PERFORMER' || hist.category === 'HIGH POTENTIAL' ? 'bg-[#a5a9ad]' :
                                            'bg-[#fbb923]';

                                return (
                                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#363231] text-white flex items-center justify-center font-bold shadow-sm">
                                                {hist.user.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[#1f2937]">{hist.user}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{hist.role}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className={`px-4 py-1 rounded-full ${bgCol} text-white text-[10px] font-extrabold shadow-sm`}>
                                                {hist.category}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-[#1f2937]">{hist.date}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">par {hist.evaluator}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* MODALE DE PERSONNALISATION (Settings) */}
                {isCustomizing && (
                    <div className="absolute inset-0 z-[100] bg-[#1f2937]/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#F26322]/10 flex items-center justify-center text-[#F26322]">
                                        <Settings size={18} />
                                    </div>
                                    <h3 className="font-bold text-[#1f2937] text-lg tracking-tight">Personnalisation de la Matrice</h3>
                                </div>
                                <button onClick={() => setIsCustomizing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                                {/* Theme & Colors */}
                                <div>
                                    <h4 className="text-sm font-bold text-[#1f2937] flex items-center gap-2 mb-3">
                                        <Palette size={16} className="text-[#9A9750]" /> Thème & Couleurs des 9 Cases
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3 border border-slate-200 p-4 rounded-lg bg-slate-50">
                                        {['Solid Performer', 'High Performer', 'Star', 'Average Performer', 'Core Player', 'High Potential', 'Risk', 'Inconsistent Player', 'Potential Gem'].map((name, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-md shadow-sm">
                                                <input type="color" defaultValue={['#fbb923', '#a5a9ad', '#ea5d1f', '#8ac63f', '#fbb923', '#a5a9ad', '#ea5d1f', '#8ac63f', '#fbb923'][i]} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                                                <span className="text-[10px] font-bold text-slate-600 truncate">{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Algorithm Weights */}
                                <div>
                                    <h4 className="text-sm font-bold text-[#1f2937] flex items-center gap-2 mb-3">
                                        <Settings size={16} className="text-[#9A9750]" /> Pondération Algorithmique (X vs Y)
                                    </h4>
                                    <div className="bg-white border border-slate-200 p-5 rounded-lg space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                                <span>Axe Y (Performance M-BO)</span>
                                                <span className="text-[#F26322]">50%</span>
                                            </div>
                                            <input type="range" className="w-full accent-[#F26322]" min="0" max="100" defaultValue="50" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                                <span>Axe X (Potentiel - 16 Critères)</span>
                                                <span className="text-[#9A9750]">50%</span>
                                            </div>
                                            <input type="range" className="w-full accent-[#9A9750]" min="0" max="100" defaultValue="50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-3">
                                    <div className="mt-0.5"><CheckCircle size={16} className="text-amber-500" /></div>
                                    <div>
                                        <strong>Mode Démo :</strong> Les modifications effectuées ici sont visuelles et ne seront pas sauvegardées définitivement dans la base de données. L'interface se réinitialisera au prochain rechargement.
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                                <button onClick={() => setIsCustomizing(false)} className="px-4 py-2 border border-slate-300 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={() => setIsCustomizing(false)} className="px-4 py-2 bg-[#F26322] hover:bg-[#E35414] text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Save size={16} /> Appliquer les Nouveaux Paramètres
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
