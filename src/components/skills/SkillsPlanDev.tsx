"use client";
import React, { useState, useMemo } from 'react';
import {
    generateEmployees, CATALOGUE_FORMATIONS, REFERENTIEL_COMPETENCES,
    SCORE_LABELS, type PlanDeveloppement, type SkillsEmployee, type Formation
} from '@/lib/skillsData';
import { BookOpen, Target, Calendar, DollarSign, CheckCircle, Clock, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
    'Prioritaire': 'bg-red-100 text-red-700 border-red-200',
    'Élevé': 'bg-amber-100 text-amber-700 border-amber-200',
    'Modéré': 'bg-blue-100 text-blue-700 border-blue-200',
    'Faible': 'bg-gray-100 text-gray-600 border-gray-200',
};
const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    'Planifiée': { icon: Clock, color: 'text-blue-600' },
    'En cours': { icon: AlertTriangle, color: 'text-amber-600' },
    'Terminée': { icon: CheckCircle, color: 'text-emerald-600' },
    'Annulée': { icon: XCircle, color: 'text-red-600' },
};

function PlanCard({ plan, emp }: { plan: PlanDeveloppement; emp: SkillsEmployee }) {
    const comp = REFERENTIEL_COMPETENCES.find(c => c.id === plan.competenceId);
    const formation = plan.formationId ? CATALOGUE_FORMATIONS.find(f => f.id === plan.formationId) : null;
    const eval_ = emp.evaluations.find(e => e.competenceId === plan.competenceId);
    const currentScore = eval_?.score ?? 0;
    const gap = comp ? comp.niveauRequis - currentScore : 0;
    const StatusIcon = STATUS_CONFIG[plan.statut]?.icon ?? Clock;
    const statusColor = STATUS_CONFIG[plan.statut]?.color ?? 'text-gray-400';

    return (
        <div className={`bg-white rounded-xl border-l-4 shadow-sm p-4 hover:shadow-md transition-shadow ${plan.priorite === 'Prioritaire' ? 'border-l-red-500' : plan.priorite === 'Élevé' ? 'border-l-amber-500' : 'border-l-blue-400'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#463738] leading-tight">{comp?.description ?? plan.competenceId}</p>
                    <p className="text-xs text-[#A39D98] mt-0.5">{comp?.domaine}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded border ${PRIORITY_COLORS[plan.priorite]} shrink-0`}>{plan.priorite}</span>
            </div>
            <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(lvl => (
                        <div key={lvl} className={`w-4 h-4 rounded-sm ${lvl <= currentScore ? 'bg-[#F26322]' : lvl <= (comp?.niveauRequis ?? 0) ? 'bg-red-200' : 'bg-gray-100'}`} />
                    ))}
                    {gap > 0 && <span className="ml-2 text-xs font-black text-red-600">Gap -{gap}</span>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <StatusIcon size={14} className={statusColor} />
                    <span className={`text-xs font-semibold ${statusColor}`}>{plan.statut}</span>
                </div>
            </div>
            {formation && (
                <div className="mt-3 bg-[#E3E1DB]/40 rounded-lg p-2.5 flex items-center gap-2">
                    <BookOpen size={14} className="text-[#F26322] shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#463738] truncate">{formation.titre}</p>
                        <p className="text-xs text-[#A39D98]">{formation.fournisseur} · {formation.dureeJours}j</p>
                    </div>
                    <span className="text-xs font-black text-[#463738] shrink-0">{(formation.coutUnitaire / 1000).toFixed(0)}K FCFA</span>
                </div>
            )}
        </div>
    );
}

export function SkillsPlanDev() {
    const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('');

    const allEmployees = generateEmployees();
    const empList = useMemo(() =>
        allEmployees
            .filter(e => e.planDeveloppement.length > 0)
            .filter(e => !search || e.nom.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 100),
        [search]
    );
    const selectedEmp = selectedEmpId ? allEmployees.find(e => e.id === selectedEmpId) : null;
    const plans = selectedEmp ? selectedEmp.planDeveloppement.filter(p => !filterPriority || p.priorite === filterPriority) : [];

    // Global stats
    const allPlans = allEmployees.flatMap(e => e.planDeveloppement);
    const totalBudget = allPlans.reduce((acc, p) => acc + (p.budget ?? 0), 0);
    const prioritaireCount = allPlans.filter(p => p.priorite === 'Prioritaire').length;
    const inProgressCount = allPlans.filter(p => p.statut === 'En cours').length;
    const doneCount = allPlans.filter(p => p.statut === 'Terminée').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Plans Dev.', value: allPlans.length.toLocaleString(), icon: Target, color: 'text-[#F26322]', bg: 'bg-orange-50' },
                    { label: 'Besoins Critiques', value: prioritaireCount.toLocaleString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'En cours', value: inProgressCount.toLocaleString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Budget Estimé', value: `${(totalBudget / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(kpi => (
                    <div key={kpi.label} className={`bg-white rounded-xl p-4 border border-[#A39D98]/20 shadow-sm flex items-center gap-3`}>
                        <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                            <kpi.icon size={20} className={kpi.color} />
                        </div>
                        <div>
                            <p className="text-xs text-[#A39D98] font-semibold uppercase">{kpi.label}</p>
                            <p className="text-xl font-black text-[#463738]">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-6">
                {/* Employee List */}
                <div className="w-72 shrink-0 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#A39D98]/20">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un employé…"
                            className="w-full border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]" />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {empList.map(emp => {
                            const criticalCount = emp.planDeveloppement.filter(p => p.priorite === 'Prioritaire').length;
                            return (
                                <button key={emp.id} onClick={() => setSelectedEmpId(emp.id === selectedEmpId ? null : emp.id)}
                                    className={`w-full text-left px-4 py-3 border-b border-[#A39D98]/10 hover:bg-orange-50/50 transition-colors ${selectedEmpId === emp.id ? 'bg-orange-50 border-l-4 border-l-[#F26322]' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#463738] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                            {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[#463738] truncate">{emp.nom}</p>
                                            <p className="text-xs text-[#A39D98] truncate">{emp.site}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {criticalCount > 0 && <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">{criticalCount}</span>}
                                            <span className="text-xs text-[#A39D98]">{emp.planDeveloppement.length} plan{emp.planDeveloppement.length > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Plan Detail */}
                <div className="flex-1 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm overflow-hidden flex flex-col">
                    {selectedEmp ? (
                        <>
                            <div className="p-5 border-b border-[#A39D98]/20 bg-gradient-to-r from-[#463738]/5 to-[#F26322]/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-black text-[#463738] text-lg">{selectedEmp.nom}</h2>
                                        <p className="text-sm text-[#A39D98]">{selectedEmp.fonction} — {selectedEmp.site}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                                            className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                                            <option value="">Toutes priorités</option>
                                            {['Prioritaire', 'Élevé', 'Modéré', 'Faible'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* Budget */}
                                <div className="mt-3 flex gap-4 text-xs">
                                    <span className="text-[#A39D98]">Budget estimé : <strong className="text-[#463738]">{(plans.reduce((acc, p) => acc + (p.budget ?? 0), 0) / 1000).toFixed(0)}K FCFA</strong></span>
                                    <span className="text-[#A39D98]">Formations liées : <strong className="text-[#463738]">{plans.filter(p => p.formationId).length}</strong></span>
                                    <span className="text-[#A39D98]">Terminées : <strong className="text-emerald-600">{plans.filter(p => p.statut === 'Terminée').length}</strong></span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5">
                                {plans.length === 0 ? (
                                    <div className="text-center text-[#A39D98] py-12">Aucun plan de développement pour ce filtre.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {plans.map((plan, idx) => <PlanCard key={idx} plan={plan} emp={selectedEmp} />)}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-[#A39D98]/20 flex justify-end gap-3">
                                <button className="px-4 py-2 border border-[#A39D98]/30 rounded-lg text-sm font-bold text-[#A39D98] hover:bg-[#E3E1DB] transition-colors">Imprimer le plan</button>
                                <button className="px-6 py-2 bg-[#F26322] text-white rounded-lg text-sm font-bold hover:bg-[#E35414] shadow-md transition-colors flex items-center gap-2">
                                    <Calendar size={15} /> Planifier les formations
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-8">
                            <Target size={48} className="text-[#A39D98]/40" />
                            <p className="font-bold text-[#463738]">Sélectionnez un employé</p>
                            <p className="text-sm text-[#A39D98]">Consultez et gérez les plans de développement individuels liés aux gaps de compétences identifiés</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
