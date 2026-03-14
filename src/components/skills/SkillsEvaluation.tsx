"use client";
import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Save, User2 } from 'lucide-react';
import {
    generateEmployees, REFERENTIEL_COMPETENCES, SCORE_LABELS,
    DEPARTEMENTS_LIST, SITES_LIST, type SkillsEmployee, type SkillScore
} from '@/lib/skillsData';

function ScoreDots({ score, required }: { score: SkillScore; required: number }) {
    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${lvl <= score
                        ? lvl <= required
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-blue-500 border-blue-500'
                        : lvl <= required
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                    }`}>
                    {lvl <= score && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
            ))}
        </div>
    );
}

function EvaluationSlider({ score, onChange }: { score: SkillScore; onChange: (v: SkillScore) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(lvl => {
                const info = SCORE_LABELS[lvl];
                return (
                    <button key={lvl} title={info.label} onClick={() => onChange(lvl as SkillScore)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all border-2 ${lvl <= score
                                ? 'bg-[#F26322] text-white border-[#F26322] shadow-md'
                                : 'border-[#A39D98]/30 text-[#A39D98] hover:border-[#F26322]/50 hover:text-[#F26322]'
                            }`}>
                        {lvl}
                    </button>
                );
            })}
        </div>
    );
}

export function SkillsEvaluation() {
    const [selectedEmp, setSelectedEmp] = useState<SkillsEmployee | null>(null);
    const [filterDept, setFilterDept] = useState('');
    const [filterSite, setFilterSite] = useState('');
    const [search, setSearch] = useState('');
    const [editScores, setEditScores] = useState<Record<string, SkillScore>>({});
    const [saved, setSaved] = useState(false);
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

    const allEmployees = generateEmployees();
    const filtered = allEmployees.filter(e => {
        if (filterDept && e.departement !== filterDept) return false;
        if (filterSite && e.site !== filterSite) return false;
        if (search && !e.nom.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }).slice(0, 100);

    function selectEmployee(emp: SkillsEmployee) {
        setSelectedEmp(emp);
        const scores: Record<string, SkillScore> = {};
        emp.evaluations.forEach(ev => { scores[ev.competenceId] = ev.score; });
        setEditScores(scores);
        setSaved(false);
    }

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    // Group competences by domain
    const domains = [...new Set(REFERENTIEL_COMPETENCES.map(c => c.domaine))];

    // Relevant competences for selected employee's department
    const relevantComps = selectedEmp
        ? REFERENTIEL_COMPETENCES.filter(c =>
            selectedEmp.evaluations.some(ev => ev.competenceId === c.id) ||
            c.domaine === 'Leadership'
        )
        : [];

    const totalScore = relevantComps.reduce((acc, c) => acc + (editScores[c.id] ?? 0), 0);
    const maxPossible = relevantComps.length * 5;
    const totalRequired = relevantComps.reduce((acc, c) => acc + c.niveauRequis, 0);
    const globalPct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const gap = totalRequired - totalScore;

    return (
        <div className="flex gap-6 animate-in fade-in duration-300 h-full min-h-0">
            {/* Left: Employee List */}
            <div className="w-72 shrink-0 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[#A39D98]/20 space-y-2">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un employé…"
                        className="w-full border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]" />
                    <div className="flex gap-2">
                        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                            className="flex-1 border border-[#A39D98]/30 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#F26322]">
                            <option value="">Tous depts</option>
                            {DEPARTEMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
                            className="flex-1 border border-[#A39D98]/30 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#F26322]">
                            <option value="">Tous sites</option>
                            {SITES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.map(emp => (
                        <button key={emp.id} onClick={() => selectEmployee(emp)}
                            className={`w-full text-left px-4 py-3 border-b border-[#A39D98]/10 hover:bg-orange-50/50 transition-colors ${selectedEmp?.id === emp.id ? 'bg-orange-50 border-l-4 border-l-[#F26322]' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#463738] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                    {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#463738] truncate">{emp.nom}</p>
                                    <p className="text-xs text-[#A39D98] truncate">{emp.fonction}</p>
                                    <p className="text-xs text-[#A39D98]">{emp.site}</p>
                                </div>
                                <div className="ml-auto shrink-0">
                                    <span className={`text-xs font-black ${(emp.scoreGlobal ?? 0) >= 70 ? 'text-emerald-600' : (emp.scoreGlobal ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {emp.scoreGlobal}%
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Evaluation Panel */}
            {selectedEmp ? (
                <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-[#A39D98]/20 bg-gradient-to-r from-[#463738]/5 to-[#F26322]/5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#463738] text-white font-bold text-lg flex items-center justify-center shadow-lg">
                                    {selectedEmp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#463738]">{selectedEmp.nom}</h2>
                                    <p className="text-sm text-[#A39D98]">{selectedEmp.fonction} — {selectedEmp.departement}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-[#463738] text-white px-2 py-0.5 rounded font-bold">{selectedEmp.site}</span>
                                        <span className="text-xs bg-[#E3E1DB] text-[#463738] px-2 py-0.5 rounded font-bold">{selectedEmp.pays}</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{selectedEmp.typeContrat}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Score Summary */}
                            <div className="flex gap-4 text-center">
                                <div className="bg-white rounded-xl p-3 border border-[#A39D98]/20 shadow-sm min-w-[80px]">
                                    <p className={`text-3xl font-black ${globalPct >= 70 ? 'text-emerald-600' : globalPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{globalPct}%</p>
                                    <p className="text-xs text-[#A39D98] font-semibold mt-1">Score Global</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-red-200 shadow-sm min-w-[80px]">
                                    <p className={`text-3xl font-black ${gap <= 0 ? 'text-emerald-600' : gap <= 5 ? 'text-amber-600' : 'text-red-600'}`}>{gap > 0 ? `-${gap}` : '✓'}</p>
                                    <p className="text-xs text-[#A39D98] font-semibold mt-1">Écart Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Competences by Domain */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {domains.filter(d => relevantComps.some(c => c.domaine === d)).map(domain => {
                            const domainComps = relevantComps.filter(c => c.domaine === domain);
                            const isExpanded = expandedDomain === domain;
                            const domainScore = domainComps.reduce((acc, c) => acc + (editScores[c.id] ?? 0), 0);
                            const domainMax = domainComps.length * 5;
                            const domainPct = domainMax > 0 ? Math.round((domainScore / domainMax) * 100) : 0;
                            const domainGap = domainComps.reduce((acc, c) => acc + Math.max(0, c.niveauRequis - (editScores[c.id] ?? 0)), 0);

                            return (
                                <div key={domain} className="border border-[#A39D98]/20 rounded-xl overflow-hidden">
                                    <button onClick={() => setExpandedDomain(isExpanded ? null : domain)}
                                        className="w-full flex items-center justify-between p-4 bg-[#E3E1DB]/30 hover:bg-[#E3E1DB]/60 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Star size={16} className="text-[#F26322]" />
                                            <span className="font-bold text-[#463738]">{domain}</span>
                                            <span className="text-xs text-[#A39D98]">({domainComps.length} compétences)</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div className={`h-2 rounded-full transition-all ${domainPct >= 70 ? 'bg-emerald-500' : domainPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${domainPct}%` }} />
                                                </div>
                                                <span className={`text-sm font-black ${domainPct >= 70 ? 'text-emerald-600' : domainPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{domainPct}%</span>
                                            </div>
                                            {domainGap > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Gap: -{domainGap}</span>}
                                            {isExpanded ? <ChevronUp size={16} className="text-[#A39D98]" /> : <ChevronDown size={16} className="text-[#A39D98]" />}
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="divide-y divide-[#A39D98]/10">
                                            {domainComps.map(comp => {
                                                const score = editScores[comp.id] ?? 0 as SkillScore;
                                                const gap = comp.niveauRequis - score;
                                                const info = SCORE_LABELS[score];
                                                return (
                                                    <div key={comp.id} className="p-4 flex items-center gap-4 hover:bg-orange-50/20 transition-colors">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[#463738]">{comp.description}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-[#A39D98]">Niveau requis: <strong className="text-[#463738]">{comp.niveauRequis}/5</strong></span>
                                                                {gap > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Gap -{gap}</span>}
                                                                {gap <= 0 && score > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">✓ Acquis</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <EvaluationSlider score={score} onChange={v => setEditScores(s => ({ ...s, [comp.id]: v }))} />
                                                            {score > 0 && <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-[#A39D98]/20 flex items-center justify-between">
                        {saved && <span className="text-sm text-emerald-600 font-bold flex items-center gap-2"><Save size={15} /> Évaluation enregistrée !</span>}
                        {!saved && <span className="text-xs text-[#A39D98]">Cliquez sur les scores pour évaluer chaque compétence</span>}
                        <div className="flex gap-3">
                            <button onClick={() => setSelectedEmp(null)} className="px-4 py-2 border border-[#A39D98]/30 rounded-lg text-sm font-bold text-[#A39D98] hover:bg-[#E3E1DB] transition-colors">Fermer</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-[#F26322] text-white rounded-lg text-sm font-bold hover:bg-[#E35414] transition-colors shadow-md flex items-center gap-2">
                                <Save size={15} /> Enregistrer l'évaluation
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm flex items-center justify-center flex-col gap-4 text-center">
                    <User2 size={48} className="text-[#A39D98]/40" />
                    <p className="font-bold text-[#463738]">Sélectionnez un employé</p>
                    <p className="text-sm text-[#A39D98]">Choisissez un employé dans la liste pour commencer l'évaluation de compétences</p>
                </div>
            )}
        </div>
    );
}
