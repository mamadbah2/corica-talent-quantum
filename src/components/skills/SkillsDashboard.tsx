"use client";
import React, { useMemo } from 'react';
import {
    generateEmployees, getAnalyticsBySite, getAnalyticsByDepartement,
    getTopGapCompetences, REFERENTIEL_COMPETENCES
} from '@/lib/skillsData';
import { BarChart2, Globe, TrendingDown, AlertTriangle, Users, Award, Target } from 'lucide-react';

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function ScoreRing({ pct }: { pct: number }) {
    const r = 28; const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <svg width="72" height="72" className="-rotate-90">
            <circle cx="36" cy="36" r={r} fill="none" stroke="#E3E1DB" strokeWidth="6" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" className="transition-all duration-700" />
            <text x="36" y="36" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900"
                fill={color} transform="rotate(90 36 36)">{pct}%</text>
        </svg>
    );
}

export function SkillsDashboard() {
    const siteData = useMemo(() => getAnalyticsBySite(), []);
    const deptData = useMemo(() => getAnalyticsByDepartement(), []);
    const topGaps = useMemo(() => getTopGapCompetences(), []);
    const allEmps = useMemo(() => generateEmployees(), []);

    const globalAvgScore = Math.round(allEmps.reduce((acc, e) => acc + (e.scoreGlobal ?? 0), 0) / allEmps.length);
    const criticalCount = allEmps.filter(e => (e.gapGlobal ?? 0) > 10).length;
    const masterCount = allEmps.filter(e => (e.scoreGlobal ?? 0) >= 80).length;
    const avgGap = Math.round(allEmps.reduce((acc, e) => acc + (e.gapGlobal ?? 0), 0) / allEmps.length);

    const sexeM = allEmps.filter(e => e.sexe === 'M').length;
    const pctM = Math.round((sexeM / allEmps.length) * 100);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Score Moyen Groupe', value: `${globalAvgScore}%`, sub: 'Sur l\'ensemble des compétences', icon: Award, color: 'text-[#F26322]', bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200' },
                    { label: 'Employés à Risque', value: criticalCount.toLocaleString(), sub: 'Écart de compétences critique (>10)', icon: AlertTriangle, color: 'text-red-600', bg: 'from-red-50 to-red-100/50', border: 'border-red-200' },
                    { label: 'Experts (≥80%)', value: masterCount.toLocaleString(), sub: 'Employés au niveau expert', icon: Target, color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200' },
                    { label: 'Écart Moyen', value: `-${avgGap}`, sub: 'Points par employé vs requis', icon: TrendingDown, color: 'text-amber-600', bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200' },
                ].map(kpi => (
                    <div key={kpi.label} className={`bg-gradient-to-br ${kpi.bg} rounded-2xl p-5 border ${kpi.border} shadow-sm`}>
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-bold text-[#A39D98] uppercase tracking-wide">{kpi.label}</p>
                            <kpi.icon size={18} className={kpi.color} />
                        </div>
                        <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                        <p className="text-xs text-[#A39D98] mt-1">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Par Site */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#A39D98]/20 flex items-center gap-2">
                        <Globe size={18} className="text-[#F26322]" />
                        <h3 className="font-bold text-[#463738]">Performance par Site</h3>
                        <span className="ml-auto text-xs text-[#A39D98]">{siteData.length} sites opérationnels</span>
                    </div>
                    <div className="p-5 space-y-4">
                        {siteData.map(site => (
                            <div key={site.site} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#463738]">{site.site}</span>
                                        <span className="text-xs text-[#A39D98] bg-[#E3E1DB] px-1.5 py-0.5 rounded">{site.pays}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-[#A39D98]"><strong className="text-[#463738]">{site.count}</strong> emp.</span>
                                        {site.criticalGaps > 0 && (
                                            <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">{site.criticalGaps} risques</span>
                                        )}
                                        <span className={`font-black ${site.avgScore >= 70 ? 'text-emerald-600' : site.avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {site.avgScore}%
                                        </span>
                                    </div>
                                </div>
                                <MiniBar value={site.avgScore} max={100} color={site.avgScore >= 70 ? 'bg-emerald-500' : site.avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Par Département + Démographie */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-[#A39D98]/20 flex items-center gap-2">
                            <BarChart2 size={16} className="text-[#F26322]" />
                            <h3 className="font-bold text-[#463738] text-sm">Par Département</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {deptData.map(dept => (
                                <div key={dept.departement} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-[#463738] truncate max-w-[130px]">{dept.departement}</span>
                                        <span className={`font-black ${dept.avgScore >= 70 ? 'text-emerald-600' : dept.avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{dept.avgScore}%</span>
                                    </div>
                                    <MiniBar value={dept.avgScore} max={100} color={dept.avgScore >= 70 ? 'bg-emerald-400' : dept.avgScore >= 50 ? 'bg-amber-400' : 'bg-red-400'} />
                                    <p className="text-xs text-[#A39D98]">{dept.count} emp. · Couverture {dept.tauxCouverture}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Démographie */}
                    <div className="bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm p-4">
                        <h3 className="font-bold text-[#463738] text-sm mb-3 flex items-center gap-2"><Users size={16} className="text-[#F26322]" /> Démographie</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <ScoreRing pct={pctM} />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold text-blue-700">Hommes</span>
                                    <span className="font-black text-blue-700">{pctM}%</span>
                                </div>
                                <MiniBar value={pctM} max={100} color="bg-blue-500" />
                                <div className="flex justify-between text-xs mt-2 mb-1">
                                    <span className="font-bold text-pink-600">Femmes</span>
                                    <span className="font-black text-pink-600">{100 - pctM}%</span>
                                </div>
                                <MiniBar value={100 - pctM} max={100} color="bg-pink-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            {(['CDI', 'CDD', 'Interim', 'Sous-traitant'] as const).map(type => {
                                const cnt = allEmps.filter(e => e.typeContrat === type).length;
                                const pct = Math.round((cnt / allEmps.length) * 100);
                                return (
                                    <div key={type} className="bg-[#E3E1DB]/40 rounded-lg p-2 text-center">
                                        <p className="font-black text-[#463738]">{pct}%</p>
                                        <p className="text-[#A39D98]">{type}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Gaps */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-red-100 bg-red-50/30 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600" />
                    <h3 className="font-bold text-[#463738]">Top 10 Déficits de Compétences Critiques</h3>
                    <span className="ml-auto text-xs text-[#A39D98]">Classés par écart moyen descroissant</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#A39D98]/10 bg-[#E3E1DB]/20">
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Rang</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Compétence</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Domaine</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Requis</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Écart Moyen</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Employés</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#A39D98] uppercase">Urgence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topGaps.map((gap, idx) => (
                                <tr key={gap.competence.id} className="border-b border-[#A39D98]/10 hover:bg-red-50/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${idx < 3 ? 'bg-red-600 text-white' : idx < 6 ? 'bg-amber-500 text-white' : 'bg-[#E3E1DB] text-[#463738]'}`}>{idx + 1}</span>
                                    </td>
                                    <td className="px-5 py-3 max-w-xs">
                                        <p className="font-semibold text-[#463738] text-xs">{gap.competence.description}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="bg-[#E3E1DB] text-[#463738] text-xs px-2 py-0.5 rounded font-medium">{gap.competence.domaine}</span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-[#463738]">{gap.competence.niveauRequis}/5</td>
                                    <td className="px-5 py-3">
                                        <span className={`font-black text-sm ${gap.avgGap >= 2 ? 'text-red-600' : gap.avgGap >= 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            -{gap.avgGap}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-[#463738]">{gap.employeesAffected.toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${gap.avgGap >= 2 ? 'bg-red-100 text-red-700' : gap.avgGap >= 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {gap.avgGap >= 2 ? '🔴 Critique' : gap.avgGap >= 1 ? '🟡 Élevé' : '🟢 OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
