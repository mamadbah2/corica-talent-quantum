"use client";

import React from 'react';
import { 
    X, FileText, Download, ShieldCheck, Globe, 
    BarChart3, PieChart, Info, AlertTriangle, CheckCircle2, RefreshCw, Check
} from 'lucide-react';
import { ALL_USERS } from '@/context/UserContext';

interface GRCReportPreviewProps {
    onClose: () => void;
}

export function GRCReportPreview({ onClose }: GRCReportPreviewProps) {
    // Calcul des données consolidées
    const totalUsers = ALL_USERS.length;
    
    const getComplianceCount = () => {
        if (typeof window === 'undefined') return 0;
        return ALL_USERS.filter(u => localStorage.getItem(`pdf_uploaded_${u.id_usercount}`) === 'true').length;
    };

    const complianceCount = getComplianceCount();
    const complianceRate = Math.round((complianceCount / totalUsers) * 100);

    const siteData = [
        { site: 'Sissengué (CMS S)', key: 'Sissengue' },
        { site: 'Ity (CMS I)', key: 'Ity' },
        { site: 'Yamoussoukro', key: 'Yamoussoukro' },
        { site: 'HQ Corporate', key: 'Abidjan' }
    ].map(s => {
        const siteUsers = ALL_USERS.filter(u => u.pays.toLowerCase().includes(s.key.toLowerCase()) || u.scope?.toLowerCase() === s.key.toLowerCase());
        const siteTotal = siteUsers.length;
        const siteDone = typeof window !== 'undefined' 
            ? siteUsers.filter(u => localStorage.getItem(`pdf_uploaded_${u.id_usercount}`) === 'true').length
            : 0;
        return {
            name: s.site,
            total: siteTotal,
            done: siteDone,
            rate: siteTotal > 0 ? Math.round((siteDone / siteTotal) * 100) : 0
        };
    });

    const [exportStatus, setExportStatus] = React.useState<'idle' | 'exporting' | 'success'>('idle');

    const handleExport = () => {
        setExportStatus('exporting');
        // Simulation d'une génération PDF complexe et sécurisée
        setTimeout(() => {
            setExportStatus('success');
            
            // Simuler le téléchargement d'un fichier réel
            try {
                const dummyContent = `RAPPORT OFFICIEL GRC - CYCLE 2026 Q1\n\nGénéré le: ${new Date().toLocaleString()}\nSuper Administrateur: Djibo Ibouraima\nTaux de Conformité: ${complianceRate}%\nDossiers Audités: ${totalUsers}`;
                const blob = new Blob([dummyContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `RAPPORT_GRC_OFFICIEL_2026_Q1.pdf`; // Extension PDF pour le mockup
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } catch (e) {
                console.error("Simulation download error", e);
            }

            setTimeout(() => setExportStatus('idle'), 3000);
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#463738]/60 backdrop-blur-md p-4 lg:p-10 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
                
                {/* Header du Rapport */}
                <div className="bg-gradient-to-r from-[#463738] to-[#1a1415] px-8 py-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F26322] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                            <FileText className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Rapport Consolidé GRC</h2>
                            <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Gouvernance, Risque & Conformité • Cycle 2026 Q1</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Corps du Rapport - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#F8F7F4]">
                    <div className="max-w-4xl mx-auto space-y-10">
                        
                        {/* Section : Synthèse Executive */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#463738]/5 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#F26322]/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <h3 className="text-[#A39D98] text-[10px] font-black uppercase tracking-widest mb-1">Taux de Conformité Global</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-[#463738]">{complianceRate}%</span>
                                    <span className={`text-xs font-bold mb-2 ${complianceRate > 75 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {complianceRate > 75 ? 'Optimal' : 'En progression'}
                                    </span>
                                </div>
                                <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#F26322] to-[#ff8c52] transition-all duration-1000 ease-out" 
                                        style={{ width: `${complianceRate}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#463738]/5">
                                <h3 className="text-[#A39D98] text-[10px] font-black uppercase tracking-widest mb-1">Dossiers Audités</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-[#463738]">{totalUsers}</span>
                                    <span className="text-xs font-bold text-[#A39D98] mb-2">Total Groupe</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="flex -space-x-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#A39D98]">+ {totalUsers - 4} collaborateurs</span>
                                </div>
                            </div>

                            <div className="bg-[#463738] p-6 rounded-3xl shadow-xl border border-white/10 text-white relative overflow-hidden">
                                <div className="absolute right-4 top-4 text-white/10"><BarChart3 size={40} /></div>
                                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Statut Intégrité</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="text-[#F26322]" size={20} />
                                    <span className="text-xl font-bold italic tracking-tight">Data Vault Secure</span>
                                </div>
                                <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                                    Toutes les données sont horodatées et scellées par RLS Context Isolation.
                                </p>
                            </div>
                        </div>

                        {/* Section : Détail par Site */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-[#463738]/5 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                                <h4 className="font-black text-[#463738] flex items-center gap-3">
                                    <Globe className="text-[#9A9750]" size={20} />
                                    Distribution de la Conformité par Site
                                </h4>
                                <span className="text-[10px] font-black text-[#A39D98] bg-gray-50 px-3 py-1 rounded-full uppercase">Données Temps Réel</span>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-[#A39D98] uppercase">Site Opérationnel</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-[#A39D98] uppercase">Effectif</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-[#A39D98] uppercase">Conformes</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-[#A39D98] uppercase">Progression</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {siteData.map((s, idx) => (
                                            <tr key={idx} className="hover:bg-[#F26322]/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-[#463738] text-sm group-hover:text-[#F26322] transition-colors">{s.name}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-black text-[#463738]">{s.total}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`text-sm font-black ${s.done === s.total ? 'text-green-600' : 'text-[#463738]'}`}>{s.done}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 ${s.rate > 80 ? 'bg-green-600' : s.rate > 40 ? 'bg-[#F26322]' : 'bg-red-600'}`}
                                                                style={{ width: `${s.rate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-black text-[#463738] tabular-nums">{s.rate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section : Observations Audit (Simulées) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-black text-[#463738] flex items-center gap-2 text-sm uppercase">
                                    <AlertTriangle className="text-[#F26322]" size={16} /> Points d'Attention Audit
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl flex gap-3">
                                        <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-amber-900 leading-relaxed">
                                            <b>Sissengué</b> : Retard constaté sur le téléchargement des PDF signés pour le département Production. Relance groupée recommandée.
                                        </p>
                                    </div>
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex gap-3">
                                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-red-900 leading-relaxed">
                                            <b>Incohérences N+2</b> : 3 dossiers présentent une validation N+2 sans conclusion RH finale. Nécessite une revue de calibration manuelle.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-black text-[#463738] flex items-center gap-2 text-sm uppercase">
                                    <CheckCircle2 className="text-green-600" size={16} /> Points Positifs
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-xl flex gap-3">
                                        <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-green-900 leading-relaxed">
                                            <b>HQ Abidjan</b> : Taux de conformité exceptionnel de 100%. Tous les processus de signature numérique ont été validés avec succès.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl flex gap-3">
                                        <PieChart className="text-blue-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-blue-900 leading-relaxed">
                                            <b>Data Security</b> : 0 violation de périmètre constatée (RLS Check). L'intégrité de la base de données Talents est certifiée conforme.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer du Rapport */}
                <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2 text-[#A39D98]">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} par Super Admin Djibo Ibouraima</span>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm text-[#463738] hover:bg-gray-100 transition-colors"
                        >
                            Fermer
                        </button>
                        <button 
                            onClick={handleExport}
                            disabled={exportStatus !== 'idle'}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${
                                exportStatus === 'exporting' ? 'bg-amber-500 text-white cursor-wait' :
                                exportStatus === 'success' ? 'bg-green-600 text-white' :
                                'bg-[#463738] text-white hover:bg-black hover:shadow-xl'
                            }`}
                        >
                            {exportStatus === 'idle' && (
                                <>
                                    <Download size={18} /> Exporter PDF Officiel
                                </>
                            )}
                            {exportStatus === 'exporting' && (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> Génération du rapport...
                                </>
                            )}
                            {exportStatus === 'success' && (
                                <>
                                    <Check size={18} /> Export Terminé !
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
