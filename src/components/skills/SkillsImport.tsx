"use client";
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Download, X } from 'lucide-react';
import { generateEmployees, PAYS_LIST, SITES_LIST, DEPARTEMENTS_LIST } from '@/lib/skillsData';

export function SkillsImport() {
    const [dragOver, setDragOver] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [filter, setFilter] = useState({ pays: '', site: '', dept: '' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;

    const allEmployees = generateEmployees();
    const filtered = allEmployees.filter(e => {
        if (filter.pays && e.pays !== filter.pays) return false;
        if (filter.site && e.site !== filter.site) return false;
        if (filter.dept && e.departement !== filter.dept) return false;
        if (search && !e.nom.toLowerCase().includes(search.toLowerCase()) && !e.fonction.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    function simulateImport() {
        setImportStatus('processing');
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); setImportStatus('done'); return 100; }
                return p + Math.floor(Math.random() * 8) + 3;
            });
        }, 120);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Employés', value: '2 000', icon: Users, color: 'text-[#F26322]', bg: 'bg-orange-50' },
                    { label: 'Sites couverts', value: '12', icon: FileSpreadsheet, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pays', value: '5', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Évalués', value: `${filtered.filter(e => e.evaluations.length > 0).length}`, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-[#A39D98]/20 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-xs text-[#A39D98] font-semibold uppercase tracking-wide">{stat.label}</p>
                            <p className="text-xl font-black text-[#463738]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Import Zone */}
            <div className="bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#A39D98]/20 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-[#463738] flex items-center gap-2"><Upload size={18} className="text-[#F26322]" /> Import Fichier Excel</h3>
                        <p className="text-xs text-[#A39D98] mt-1">Importez un fichier .xlsx compatible avec la structure CORICA Skills Matrix</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-[#F26322] border border-[#F26322]/30 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                        <Download size={15} /> Télécharger le modèle
                    </button>
                </div>
                <div className="p-6">
                    {importStatus === 'idle' && (
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); simulateImport(); }}
                            onClick={simulateImport}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-[#F26322] bg-orange-50' : 'border-[#A39D98]/40 hover:border-[#F26322]/60 hover:bg-orange-50/30'}`}
                        >
                            <FileSpreadsheet size={40} className="mx-auto text-[#A39D98] mb-3" />
                            <p className="font-bold text-[#463738]">Glissez votre fichier Excel ici</p>
                            <p className="text-sm text-[#A39D98] mt-1">ou cliquez pour sélectionner — formats .xlsx, .xlsb, .xlsm acceptés</p>
                        </div>
                    )}
                    {importStatus === 'processing' && (
                        <div className="p-8 text-center">
                            <div className="text-lg font-bold text-[#463738] mb-4">Traitement en cours… {Math.min(progress, 100)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#F26322] to-orange-400 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                            <p className="text-sm text-[#A39D98]">Analyse des données et détection des correspondances compétences…</p>
                        </div>
                    )}
                    {importStatus === 'done' && (
                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                            <CheckCircle size={28} className="text-emerald-600 shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="font-bold text-emerald-800 text-lg">Import réussi — 2 000 employés chargés</p>
                                <p className="text-sm text-emerald-600 mt-1">40 compétences mappées · 12 sites · 5 pays · 0 erreur détectée</p>
                            </div>
                            <button onClick={() => { setImportStatus('idle'); setProgress(0); }} className="text-emerald-600 hover:text-emerald-800"><X size={20} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtres + Liste */}
            <div className="bg-white rounded-2xl border border-[#A39D98]/20 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#A39D98]/20 flex flex-wrap gap-3 items-center">
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Rechercher par nom ou fonction…"
                        className="flex-1 min-w-[200px] border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]"
                    />
                    <select value={filter.pays} onChange={e => { setFilter(f => ({ ...f, pays: e.target.value })); setPage(0); }}
                        className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                        <option value="">Tous les pays</option>
                        {PAYS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={filter.site} onChange={e => { setFilter(f => ({ ...f, site: e.target.value })); setPage(0); }}
                        className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                        <option value="">Tous les sites</option>
                        {SITES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filter.dept} onChange={e => { setFilter(f => ({ ...f, dept: e.target.value })); setPage(0); }}
                        className="border border-[#A39D98]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F26322]">
                        <option value="">Tous les depts</option>
                        {DEPARTEMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <span className="text-xs font-bold text-[#A39D98] ml-auto">{filtered.length} résultats</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#E3E1DB]/40 border-b border-[#A39D98]/20">
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">ID</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Nom & Prénoms</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Fonction</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Département</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Site</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Pays</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Contrat</th>
                                <th className="text-right px-4 py-3 text-xs font-bold text-[#A39D98] uppercase">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((emp, i) => (
                                <tr key={emp.id} className={`border-b border-[#A39D98]/10 hover:bg-orange-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-[#E3E1DB]/10'}`}>
                                    <td className="px-4 py-2.5 font-mono text-xs text-[#A39D98]">{emp.id}</td>
                                    <td className="px-4 py-2.5 font-semibold text-[#463738]">{emp.nom}</td>
                                    <td className="px-4 py-2.5 text-[#463738]">{emp.fonction}</td>
                                    <td className="px-4 py-2.5"><span className="bg-[#E3E1DB] text-[#463738] text-xs px-2 py-0.5 rounded font-medium">{emp.departement}</span></td>
                                    <td className="px-4 py-2.5 text-[#463738]">{emp.site}</td>
                                    <td className="px-4 py-2.5 text-[#A39D98]">{emp.pays}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${emp.typeContrat === 'CDI' ? 'bg-emerald-100 text-emerald-700' : emp.typeContrat === 'CDD' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {emp.typeContrat}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className={`font-black text-sm ${(emp.scoreGlobal ?? 0) >= 70 ? 'text-emerald-600' : (emp.scoreGlobal ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {emp.scoreGlobal}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-[#A39D98]/20 flex items-center justify-between text-sm text-[#A39D98]">
                    <span>Page {page + 1} / {totalPages || 1} — {filtered.length} employés</span>
                    <div className="flex gap-2">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded border border-[#A39D98]/30 hover:bg-[#E3E1DB] disabled:opacity-30 font-bold">←</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                            return (
                                <button key={pageNum} onClick={() => setPage(pageNum)}
                                    className={`px-3 py-1.5 rounded border font-bold transition-colors ${page === pageNum ? 'bg-[#F26322] text-white border-[#F26322]' : 'border-[#A39D98]/30 hover:bg-[#E3E1DB] text-[#463738]'}`}>
                                    {pageNum + 1}
                                </button>
                            );
                        })}
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded border border-[#A39D98]/30 hover:bg-[#E3E1DB] disabled:opacity-30 font-bold">→</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
