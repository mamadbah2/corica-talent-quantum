import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Employee } from '@/lib/data';

interface DashboardProps {
    employees: Employee[];
}

export function DashboardCards({ employees }: DashboardProps) {
    const stats = useMemo(() => {
        return {
            total: employees.length,
            highPotential: employees.filter(e => e.potential === 3).length,
            flightRisk: employees.filter(e => e.retentionRisk === 'High').length,
            completedReviews: employees.filter(e => e.status === 'Closed').length,
            completionRate: Math.round((employees.filter(e => e.status === 'Closed').length / (employees.length || 1)) * 100)
        };
    }, [employees]);

    const bubbleData = useMemo(() => {
        const matrix: Record<string, { x: number, y: number, z: number, names: string[] }> = {};
        employees.forEach(emp => {
            const key = `${emp.performance}-${emp.potential}`;
            if (!matrix[key]) {
                matrix[key] = { x: emp.performance, y: emp.potential, z: 0, names: [] };
            }
            matrix[key].z += 100;
            if (matrix[key].names.length < 5) matrix[key].names.push(emp.name);
        });
        return Object.values(matrix).map(d => ({
            ...d,
            label: d.names.length >= 5 ? `${d.names.join(', ')}...` : d.names.join(', ')
        }));
    }, [employees]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Vue Globale des Talents</h2>
                    <p className="text-sm text-slate-400 font-medium">Programme Global de Calibration H1 2026</p>
                </div>
                <button className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 text-sm font-semibold rounded-md shadow-sm transition-colors">
                    Télécharger le Rapport
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Effectif Total', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Hauts Potentiels', value: stats.highPotential, icon: TrendingUp, color: 'text-lime-400', bg: 'bg-lime-500/10 border-lime-500/20' },
                    { label: 'Risques de Départ', value: stats.flightRisk, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                    { label: 'Revues Clôturées', value: `${stats.completionRate}%`, icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="glass-panel p-6 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{card.label}</p>
                                <p className="text-3xl font-extrabold text-white">{card.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl border border-transparent ${card.bg} flex items-center justify-center`}>
                                <Icon className={card.color} size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-panel p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                        <TrendingUp size={20} className="text-orange-400" />
                        Cartographie Stratégique (Densité)
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="x" name="Performance" domain={[0.5, 3.5]} ticks={[1, 2, 3]} stroke="#94a3b8" fontSize={12} fontWeight={600} />
                                <YAxis type="number" dataKey="y" name="Potentiel" domain={[0.5, 3.5]} ticks={[1, 2, 3]} stroke="#94a3b8" fontSize={12} fontWeight={600} />
                                <ZAxis type="number" dataKey="z" range={[100, 2000]} name="Effectif" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                                    content={({ payload }) => {
                                        if (payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl max-w-[250px] backdrop-blur-md">
                                                    <p className="font-bold text-white mb-1">Perf: {data.x} | Pot: {data.y}</p>
                                                    <p className="text-sm font-semibold text-orange-400 mb-2">{data.z / 100} Employés</p>
                                                    <p className="text-xs text-slate-400">{data.label}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter data={bubbleData} fill="#f97316">
                                    {bubbleData.map((entry, index) => (
                                        <circle key={`cell-${index}`} fill="url(#colorGlow)" r={Math.min((entry.z / 20) + 10, 50)} />
                                    ))}
                                </Scatter>
                                <defs>
                                    <radialGradient id="colorGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.2} />
                                    </radialGradient>
                                </defs>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                            <AlertTriangle size={20} className="text-red-400" />
                            Alertes de Rétention Critiques
                        </h3>
                        {stats.flightRisk > 0 ? (
                            <ul className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scroll">
                                {employees.filter(e => e.retentionRisk === 'High').slice(0, 50).map((emp, i) => (
                                    <li key={i} className="flex items-center gap-4 bg-slate-800/40 p-3 border border-white/5 rounded-xl hover:border-red-500/30 hover:bg-slate-800/60 transition-colors cursor-pointer">
                                        <img src={emp.avatarUrl} className="w-10 h-10 rounded-full border border-slate-600" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{emp.name}</p>
                                            <p className="text-xs text-slate-400 font-medium truncate">{emp.role} • {emp.department}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">Alerte</span>
                                    </li>
                                ))}
                                {stats.flightRisk > 50 && (
                                    <p className="text-sm text-center text-slate-500 font-medium pt-2 w-full">+ {stats.flightRisk - 50} autres collaborateurs à risque</p>
                                )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <CheckCircle2 size={48} className="mb-4 text-emerald-500/20" />
                                <p className="font-semibold text-sm">Aucun risque majeur détecté.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
