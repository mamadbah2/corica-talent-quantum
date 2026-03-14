import React, { useState, useMemo } from 'react';
import { Employee } from '@/lib/data';
import { MoreVertical, CheckCircle2, AlertCircle, PlayCircle, Clock } from 'lucide-react';

interface EmployeeTableProps {
    employees: Employee[];
    onSelectEmployee: (emp: Employee) => void;
}

export function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const totalPages = Math.ceil(employees.length / itemsPerPage);
    const paginatedEmployees = useMemo(() => {
        return employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [employees, currentPage]);

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'Closed':
                return <span className="flex items-center justify-center w-fit gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-sm border border-green-500/20"><CheckCircle2 size={12} /> CLÔTURÉ</span>;
            case 'Director_Validation':
                return <span className="flex items-center justify-center w-fit gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-sm border border-blue-500/20"><PlayCircle size={12} /> DIR_VALIDATION</span>;
            case 'HR_Review':
                return <span className="flex items-center justify-center w-fit gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-sm border border-orange-500/20"><Clock size={12} /> HR_REVIEW</span>;
            default:
                return <span className="flex items-center justify-center w-fit gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100/10 px-2.5 py-1 rounded-sm border border-slate-500/20"><AlertCircle size={12} /> BROUILLON</span>;
        }
    };

    return (
        <div className="glass-panel rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Boîte de Réception (Revues des Talents)</h2>
                    <p className="text-sm font-semibold text-slate-400">Actions requises: <span className="text-orange-400">{employees.filter(e => e.status !== 'Closed').length}</span> éléments en attente.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md text-sm font-bold text-slate-300 shadow-sm transition-all focus:ring-2 focus:ring-orange-500">
                        Exporter
                    </button>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 border border-orange-500 rounded-md text-sm font-bold text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all">
                        Actions de Masse
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto w-full border border-white/10 rounded-lg flex-1 custom-scroll relative bg-black/20">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-400 font-bold sticky top-0 z-10 backdrop-blur-md">
                            <th className="p-4 whitespace-nowrap">Collaborateur</th>
                            <th className="p-4 whitespace-nowrap">Superviseur</th>
                            <th className="p-4 whitespace-nowrap text-center">Score 9-Box</th>
                            <th className="p-4 whitespace-nowrap text-center">Risque Départ</th>
                            <th className="p-4 whitespace-nowrap">Statut D'approbation</th>
                            <th className="p-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {paginatedEmployees.map((emp) => (
                            <tr
                                key={emp.id}
                                className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                onClick={() => onSelectEmployee(emp)}
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <img src={emp.avatarUrl} alt={emp.name} className="w-9 h-9 rounded-full border border-slate-700 group-hover:border-orange-500 transition-colors" />
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">{emp.name}</p>
                                            <p className="text-[10px] font-semibold text-slate-400">{emp.role} • {emp.department}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 text-xs font-bold text-slate-300">{emp.manager}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-bold ${emp.performance === 3 ? 'bg-green-500/10 text-green-400 border-green-500/20' : emp.performance === 2 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            P: {emp.performance}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-bold ${emp.potential === 3 ? 'bg-green-500/10 text-green-400 border-green-500/20' : emp.potential === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            Pt: {emp.potential}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${emp.retentionRisk === 'High' ? 'text-red-400 bg-red-500/10 border border-red-500/20' : emp.retentionRisk === 'Medium' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                                        {emp.retentionRisk}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <StatusBadge status={emp.status || 'Draft'} />
                                </td>
                                <td className="p-3 text-right text-slate-500 group-hover:text-white">
                                    <div className="p-1 hover:bg-slate-700/80 rounded-md inline-block transition-colors" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical size={16} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-slate-400">
                    Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, employees.length)} sur {employees.length} collaborateurs
                </p>
                <div className="flex items-center gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1.5 border border-slate-700 rounded-md text-xs font-bold text-slate-300 disabled:opacity-50 hover:bg-slate-800"
                    >
                        Précédent
                    </button>
                    <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-md border border-orange-500/20">
                        Page {currentPage} / {totalPages}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1.5 border border-slate-700 rounded-md text-xs font-bold text-slate-300 disabled:opacity-50 hover:bg-slate-800"
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </div>
    );
}
