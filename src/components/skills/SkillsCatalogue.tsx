"use client";
import React, { useState } from 'react';
import { CATALOGUE_FORMATIONS, generateEmployees } from '@/lib/skillsData';
import { BookOpen, Clock, DollarSign, Star, Users, Filter, Award, Building2 } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
    'Externe': 'bg-purple-100 text-purple-700',
    'Interne': 'bg-emerald-100 text-emerald-700',
    'E-learning': 'bg-blue-100 text-blue-700',
    'Sur le tas': 'bg-amber-100 text-amber-700',
};

export function SkillsCatalogue() {
    const [search, setSearch] = useState('');
    const [filterDomaine, setFilterDomaine] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selected, setSelected] = useState<typeof CATALOGUE_FORMATIONS[0] | null>(null);

    const domaines = [...new Set(CATALOGUE_FORMATIONS.map(f => f.domaine))];
    const types = ['Interne', 'Externe', 'E-learning', 'Sur le tas'];

    const filtered = CATALOGUE_FORMATIONS.filter(f => {
        if (filterDomaine && f.domaine !== filterDomaine) return false;
        if (filterType && f.type !== filterType) return false;
        if (search && !f.titre.toLowerCase().includes(search.toLowerCase()) && !f.fournisseur.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const allEmps = generateEmployees();
    const totalBudgetIfAll = CATALOGUE_FORMATIONS.reduce((acc, f) => acc + f.coutUnitaire, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Formations au catalogue', value: CATALOGUE_FORMATIONS.length, icon: BookOpen, color: 'text-[#F26322]', bg: 'bg-orange-50' },
                    { label: 'Durée moyenne', value: `${Math.round(CATALOGUE_FORMATIONS.reduce((a, f) => a + f.dureeJours, 0) / CATALOGUE_FORMATIONS.length)}j`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Fournisseurs', value: new Set(CATALOGUE_FORMATIONS.map(f => f.fournisseur)).size, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Coût moy. / formation', value: `${Math.round(CATALOGUE_FORMATIONS.reduce((a, f) => a + f.coutUnitaire, 0) / CATALOGUE_FORMATIONS.length / 1000)}K`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-white rounded-xl p-4 border border-[#A39D98]/20 shadow-sm flex items-center gap-3">
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

            {/* Filtres */}
            <div className="bg-white rounded-xl border border-[#A39D98]/20 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <Filter size={16} className="text-[#A39D98]" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher formation ou fournisseur…"
                    className="flex-1 min-w-[200px] border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]" />
                <select value={filterDomaine} onChange={e => setFilterDomaine(e.target.value)}
                    className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                    <option value="">Tous domaines</option>
                    {domaines.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                    <option value="">Tous types</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-xs text-[#A39D98] font-bold ml-auto">{filtered.length} formations</span>
            </div>

            {/* Cards Grid + Detail */}
            <div className="flex gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                    {filtered.map(f => (
                        <button key={f.id} onClick={() => setSelected(selected?.id === f.id ? null : f)}
                            className={`text-left bg-white rounded-xl border-2 shadow-sm p-4 hover:shadow-md transition-all ${selected?.id === f.id ? 'border-[#F26322] bg-orange-50/30' : 'border-[#A39D98]/20 hover:border-[#F26322]/40'}`}>
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className={`w-10 h-10 rounded-lg ${TYPE_COLORS[f.type]?.replace('text-', 'bg-').split(' ')[0]} flex items-center justify-center`}>
                                    <BookOpen size={18} className={TYPE_COLORS[f.type]?.split(' ')[1]} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${TYPE_COLORS[f.type]}`}>{f.type}</span>
                            </div>
                            <h4 className="font-bold text-[#463738] text-sm leading-tight mb-1">{f.titre}</h4>
                            <p className="text-xs text-[#A39D98] mb-3">{f.fournisseur}</p>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-[#A39D98]">
                                    <Clock size={12} /> <span>{f.dureeJours} jour{f.dureeJours > 1 ? 's' : ''}</span>
                                </div>
                                <span className="font-black text-[#F26322]">{(f.coutUnitaire / 1000).toFixed(0)}K FCFA</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-[#A39D98]/10 flex flex-wrap gap-1">
                                {f.competencesAssociees.slice(0, 3).map(cid => (
                                    <span key={cid} className="text-xs bg-[#E3E1DB] text-[#463738] px-1.5 py-0.5 rounded">{cid}</span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="w-80 shrink-0 bg-white rounded-2xl border border-[#F26322]/30 shadow-md p-5 space-y-4 self-start sticky top-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl ${TYPE_COLORS[selected.type]?.split(' ')[0]} flex items-center justify-center`}>
                                <BookOpen size={22} className={TYPE_COLORS[selected.type]?.split(' ')[1]} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#463738] text-sm leading-tight">{selected.titre}</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${TYPE_COLORS[selected.type]}`}>{selected.type}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#A39D98]">Fournisseur</span>
                                <span className="font-bold text-[#463738]">{selected.fournisseur}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#A39D98]">Durée</span>
                                <span className="font-bold text-[#463738]">{selected.dureeJours} jour{selected.dureeJours > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#A39D98]">Domaine</span>
                                <span className="font-bold text-[#463738]">{selected.domaine}</span>
                            </div>
                            <div className="flex justify-between border-t border-[#A39D98]/20 pt-2">
                                <span className="text-[#A39D98]">Coût unitaire</span>
                                <span className="font-black text-[#F26322] text-lg">{(selected.coutUnitaire / 1000).toFixed(0)}K FCFA</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-[#A39D98] uppercase mb-2">Compétences ciblées</p>
                            <div className="space-y-1">
                                {selected.competencesAssociees.map(cid => {
                                    const empWithGap = allEmps.filter(e => e.evaluations.some(ev => ev.competenceId === cid && ev.score < 3)).length;
                                    return (
                                        <div key={cid} className="flex items-center justify-between bg-[#E3E1DB]/30 rounded-lg px-3 py-2">
                                            <span className="text-xs font-bold text-[#463738]">{cid}</span>
                                            <span className="text-xs text-[#A39D98]">{empWithGap} emp. en gap</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-[#A39D98]/20 pt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-[#A39D98]">
                                <Users size={12} />
                                <span>Employés éligibles : <strong className="text-[#463738]">{allEmps.filter(e => e.planDeveloppement.some(p => p.formationId === selected.id)).length}</strong></span>
                            </div>
                            <button className="w-full bg-[#F26322] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#E35414] transition-colors shadow-md">
                                Inscrire des employés
                            </button>
                            <button className="w-full border border-[#A39D98]/30 text-[#463738] py-2.5 rounded-xl font-bold text-sm hover:bg-[#E3E1DB] transition-colors">
                                Simuler le budget
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
