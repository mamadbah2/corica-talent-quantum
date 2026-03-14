"use client";

import React, { useState } from 'react';
import {
    Bell, LogOut, BarChart3, Users, User,
    Mail, Settings, CheckSquare, Building2,
    MapPin, AlertCircle, FileText, Home, ChevronRight,
    Star, History, UserPlus, Monitor, ClipboardList, BarChart2, CheckCircle,
    Download, ChevronDown, Presentation, FileSpreadsheet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { MyProfileMockup } from '@/components/mockups/MyProfileMockup';
import { NineBoxModal } from '@/components/NineBoxModal';
import { useUser, ALL_USERS } from '@/context/UserContext';
import { SiteManagementView } from '@/components/mockups/SiteManagementView';
import { DownloadGuideButton } from '@/components/DownloadGuideButton';
import { NavButtons } from '@/components/NavButtons';

type ViewMode = 'MY_PROFILE' | 'MY_TEAM' | 'SITE_MGMT' | 'SITE_ADMIN' | 'REVISION_RH' | 'RAPPORT_PILOTAGE';
type TeamSubView = 'LIST' | 'EVALUATE' | 'HISTORY';

// ─── Types ──────────────────────────────────────────────────────────────────
interface TeamMember {
    id: number;
    nom: string;
    fonction: string;
    departement: string;
    scope: string;
    usercount: string;
}

// ─── Évaluation en étoiles ──────────────────────────────────────────────────
function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    const labels = ['', 'Faible', 'Passable', 'Bon', 'Excellent'];
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#A39D98] uppercase">{label}</span>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(s => (
                    <button
                        key={s}
                        onClick={() => onChange(s)}
                        className={`transition-transform hover:scale-125 ${s <= value ? 'text-[#F26322]' : 'text-[#A39D98]/40'}`}
                        title={labels[s]}
                    >
                        <Star size={22} fill={s <= value ? '#F26322' : 'none'} />
                    </button>
                ))}
                {value > 0 && (
                    <span className="ml-2 text-xs font-bold text-[#F26322] bg-[#F26322]/10 px-2 py-0.5 rounded">
                        {labels[value]}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function SiteAdminDashboard() {
    const router = useRouter();
    const { currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>('SITE_ADMIN');
    const [teamSubView, setTeamSubView] = useState<TeamSubView>('LIST');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [starPerf, setStarPerf] = useState(0);
    const [starPotential, setStarPotential] = useState(0);

    const [showNineBox, setShowNineBox] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const VIEWS: ViewMode[] = ['MY_PROFILE', 'MY_TEAM', 'SITE_ADMIN', 'SITE_MGMT', 'REVISION_RH', 'RAPPORT_PILOTAGE'];
    const currentViewIndex = VIEWS.indexOf(viewMode);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1]);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0]);

    const handleExportReport = (format: string) => {
        setShowExportMenu(false);
        showToast(`Génération du Rapport de pilotage (${format}) en cours...`);

        setTimeout(() => {
            const newWindow = window.open('', '_blank');
            if (!newWindow) return;

            let formatColor = format === 'Excel' ? '#107c41' : format === 'Word' ? '#2b579a' : '#c43e1c';

            newWindow.document.write(`
                <html>
                    <head>
                        <title>Rapport de Pilotage - Corica</title>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; background: #E3E1DB; margin:0; padding:40px; color:#463738; }
                            .paper { background: white; max-width: 900px; margin: 0 auto; padding: 50px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-top: 10px solid #F26322; }
                            h1 { color: #463738; font-size: 28px; margin-bottom: 5px; }
                            h2 { color: #9A9750; font-size: 18px; margin-top: 0; }
                            .format-indicator { display: inline-block; background: ${formatColor}; color: white; padding: 5px 15px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 30px; border: 1px solid #ddd; }
                            th { background: #463738; color: white; padding: 12px; text-align: left; font-size: 14px; }
                            td { border-bottom: 1px solid #ddd; padding: 12px; font-size: 14px; }
                            .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
                            .logo-placeholder { width: 50px; height: 50px; background: #463738; border-radius: 4px; display: inline-block; vertical-align: middle; margin-right: 15px;}
                            .header-wrapper { display: flex; align-items: center; margin-bottom: 30px; }
                        </style>
                    </head>
                    <body>
                        <div class="paper">
                            <div class="format-indicator">Document généré compatible ${format}</div>
                            <div class="header-wrapper">
                                <div class="logo-placeholder"></div>
                                <div>
                                    <h1>Rapport Global de Pilotage (Talent Quantum)</h1>
                                    <h2>Département RH - Corica Mining Services</h2>
                                </div>
                            </div>
                            
                            <p>Voici l'export authentique des statistiques de performance et du potentiel issu du système de Calibration 9-Box.</p>
                            
                            <table>
                                <tr><th>Périmètre / Département</th><th>Effectif</th><th>Taux Achèvement</th><th>Distribution 9-Box Dominante</th></tr>
                                <tr><td>Opérations Minières</td><td>40</td><td>100%</td><td>Core Players (45%)</td></tr>
                                <tr><td>Maintenance</td><td>32</td><td>85%</td><td>Solid Performers (30%)</td></tr>
                                <tr><td>HSEQ</td><td>24</td><td>100%</td><td>High Performers (50%)</td></tr>
                                <tr><td>Ressources Humaines</td><td>16</td><td>100%</td><td>Stars (25%)</td></tr>
                            </table>
                            
                            <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-left: 4px solid #9A9750;">
                                <strong>Note Analytique du Système :</strong> La campagne affiche des résultats significativement réguliers sur le site de ${siteScope}. Le comité a permis de calibrer 12 profils litigieux vers leurs cases RH finales avec succès.
                            </div>

                            <div class="footer">
                                Propriété confidentielle &middot; Corica Talent Management System &middot; Document certifié et exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                            </div>
                        </div>
                    </body>
                </html>
            `);
            newWindow.document.close();
        }, 800);
    };

    // Membres de l'équipe directe = utilisateurs dont id_evaluateur = currentUser.id_usercount
    const directTeam: TeamMember[] = ALL_USERS
        .filter(u => currentUser && u.id_evaluateur === currentUser.id_usercount)
        .map(u => ({
            id: u.id_usercount,
            nom: u.nom_prenoms,
            fonction: u.fonction,
            departement: u.departement,
            scope: u.scope,
            usercount: u.usercount,
        }));

    const siteScope = currentUser?.scope ?? 'site';
    const pays = currentUser?.pays ?? 'Pays';
    const nomAdmin = currentUser?.nom_prenoms ?? 'Administrateur Site';

    // ─── Vue : Mon Équipe Directe ──────────────────────────────────────────
    const renderMyTeam = () => (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                <span
                    className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors"
                    onClick={() => setViewMode('SITE_ADMIN')}
                >
                    <Home size={14} className="mb-0.5" /> 🏠 Page d'accueil Site Admin
                </span>
                <ChevronRight size={14} />
                <span className="text-[#463738]">Mon Équipe Directe</span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-2">
                        <Users size={24} className="text-[#463738]" /> Mon Équipe Directe
                    </h2>
                    <p className="text-[#A39D98] text-sm mt-1">
                        En tant qu'Évaluateur N+1, évaluez vos collaborateurs directs du site <strong>{siteScope}</strong>
                    </p>
                </div>
                {teamSubView !== 'LIST' && (
                    <button
                        onClick={() => { setTeamSubView('LIST'); setSelectedMember(null); setStarPerf(0); setStarPotential(0); }}
                        className="flex items-center gap-2 px-4 py-2 border border-[#463738] text-[#463738] rounded-lg text-sm font-bold hover:bg-[#463738]/10 transition-colors"
                    >
                        ← Retour à la liste
                    </button>
                )}
            </div>

            {/* Sous-vue : Liste */}
            {teamSubView === 'LIST' && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                    <div className="p-5 border-b border-[#A39D98]/20 bg-[#463738]/5 flex justify-between items-center">
                        <h3 className="font-bold text-[#463738] text-[15px] flex items-center gap-2">
                            <Users size={18} className="text-[#463738]" />
                            Membres de mon équipe ({directTeam.length} collaborateur{directTeam.length > 1 ? 's' : ''})
                        </h3>
                    </div>

                    {directTeam.length === 0 ? (
                        <div className="p-12 text-center text-[#A39D98]">
                            <Users size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="font-bold text-lg">Aucun collaborateur direct trouvé</p>
                            <p className="text-sm mt-1">Utilisez "Gestion du Site" pour créer des membres d'équipe.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#E3E1DB]/60 text-[#A39D98]">
                                    <tr>
                                        <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Nom & Prénoms</th>
                                        <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Fonction</th>
                                        <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Département</th>
                                        <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider">Site</th>
                                        <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3E1DB]">
                                    {directTeam.map(member => (
                                        <tr key={member.id} className="hover:bg-[#E3E1DB]/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#463738] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                                                        {member.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#463738] text-[14px]">{member.nom}</p>
                                                        <p className="text-xs text-[#A39D98]">#{member.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[#463738] font-medium text-sm">{member.fonction}</td>
                                            <td className="px-5 py-4 text-[#A39D98] text-sm">{member.departement}</td>
                                            <td className="px-5 py-4">
                                                <span className="bg-[#463738]/10 text-[#463738] px-2 py-1 rounded text-xs font-bold capitalize">
                                                    {member.scope}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedMember(member); setTeamSubView('EVALUATE'); setStarPerf(0); setStarPotential(0); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F26322] text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                                                        title="Évaluer ce collaborateur"
                                                    >
                                                        <Star size={13} /> Évaluer
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedMember(member); setTeamSubView('HISTORY'); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-[#9A9750] text-white rounded-lg text-xs font-bold hover:bg-[#858245] transition-colors shadow-sm"
                                                        title="Historique des évaluations"
                                                    >
                                                        <History size={13} /> Historique évaluations
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Sous-vue : Évaluation */}
            {teamSubView === 'EVALUATE' && selectedMember && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#F26322]/30 overflow-hidden">
                    <div className="p-5 border-b border-[#F26322]/20 bg-orange-50/40 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#F26322] text-white flex items-center justify-center font-bold shadow">
                            {selectedMember.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <h3 className="font-black text-[#463738] text-[16px]">Évaluation de {selectedMember.nom}</h3>
                            <p className="text-xs text-[#A39D98]">{selectedMember.fonction} · {selectedMember.departement} · Site {selectedMember.scope}</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <StarRating label="Performance (résultats)" value={starPerf} onChange={setStarPerf} />
                            <StarRating label="Potentiel (évolution)" value={starPotential} onChange={setStarPotential} />
                        </div>

                        {starPerf > 0 && starPotential > 0 && (
                            <div className="bg-[#463738]/5 rounded-xl p-4 border border-[#463738]/20">
                                <p className="text-sm font-bold text-[#463738] mb-1">📊 Position estimée dans la grille 9-Box</p>
                                <p className="text-xs text-[#A39D98]">
                                    Performance : <strong className="text-[#F26322]">{['', 'Faible', 'Passable', 'Bon', 'Excellent'][starPerf]}</strong> ·
                                    Potentiel : <strong className="text-[#9A9750]">{['', 'Faible', 'Passable', 'Bon', 'Excellent'][starPotential]}</strong>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-[#A39D98] block mb-2 uppercase">Commentaire d'évaluation</label>
                            <textarea
                                rows={4}
                                placeholder="Saisissez votre commentaire sur les performances et le potentiel du collaborateur..."
                                className="w-full bg-[#f6f6f6] border border-[#A39D98]/30 rounded-xl px-4 py-3 text-[#463738] text-sm focus:ring-2 focus:ring-[#F26322]/30 outline-none resize-none transition-all"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button className="px-6 py-3 bg-[#F26322] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2">
                                <CheckSquare size={16} /> Soumettre l'évaluation
                            </button>
                            <button className="px-6 py-3 border border-[#A39D98]/40 text-[#A39D98] rounded-xl font-bold text-sm hover:bg-[#E3E1DB] transition-colors flex items-center gap-2">
                                <FileText size={16} /> Enregistrer brouillon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sous-vue : Historique */}
            {teamSubView === 'HISTORY' && selectedMember && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#9A9750]/30 overflow-hidden">
                    <div className="p-5 border-b border-[#9A9750]/20 bg-[#9A9750]/5 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#9A9750] text-white flex items-center justify-center font-bold shadow">
                            {selectedMember.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <h3 className="font-black text-[#463738] text-[16px]">Historique — {selectedMember.nom}</h3>
                            <p className="text-xs text-[#A39D98]">{selectedMember.fonction} · {selectedMember.departement}</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[
                                { periode: 'Campagne 2024', perf: 3, pot: 3, commentaire: 'Bonne performance, potentiel confirmé.', date: '15 Mars 2024' },
                                { periode: 'Campagne 2023', perf: 2, pot: 3, commentaire: 'Performance en progression, fort potentiel.', date: '20 Mars 2023' },
                            ].map((h, i) => (
                                <div key={i} className="bg-[#E3E1DB]/30 rounded-xl p-5 border border-[#A39D98]/20">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-black text-[#463738]">{h.periode}</h4>
                                        <span className="text-xs text-[#A39D98]">{h.date}</span>
                                    </div>
                                    <div className="flex gap-6 mb-3">
                                        <div>
                                            <p className="text-xs text-[#A39D98] font-bold mb-1">Performance</p>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4].map(s => (
                                                    <Star key={s} size={16} className={s <= h.perf ? 'text-[#F26322]' : 'text-[#A39D98]/30'} fill={s <= h.perf ? '#F26322' : 'none'} />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#A39D98] font-bold mb-1">Potentiel</p>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4].map(s => (
                                                    <Star key={s} size={16} className={s <= h.pot ? 'text-[#9A9750]' : 'text-[#A39D98]/30'} fill={s <= h.pot ? '#9A9750' : 'none'} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#463738] italic">"{h.commentaire}"</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-[#A39D98] mt-6 italic">Affichage des 2 dernières campagnes d'évaluation.</p>
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Vue : Révision RH (Comité de Calibration) ────────────────────────
    const renderRevisionRH = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                <span
                    className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors"
                    onClick={() => setViewMode('SITE_ADMIN')}
                >
                    <Home size={14} className="mb-0.5" /> 🏠 Page d'accueil Site Admin
                </span>
                <ChevronRight size={14} />
                <span className="text-[#463738]">Comité Révision RH</span>
            </div>

            <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30">
                <div>
                    <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-3">
                        <CheckSquare className="text-[#F26322]" size={28} /> Révision RH (Comité & Calibration)
                    </h2>
                    <p className="text-[#A39D98] text-sm mt-1">Supervisez, validez et arbitrez les évaluations soumises par les N+1 avant validation globale.</p>
                </div>
                <button className="bg-gradient-to-r from-[#463738] to-[#9A9750] shadow-md text-white px-5 py-2.5 rounded-xl font-bold hover:scale-[1.02] transition-all flex items-center gap-2 text-sm">
                    <CheckCircle size={16} /> Clôturer la Session
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#E3E1DB]/50 text-[#A39D98]">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase">Employé Évalué</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase">Manager (N+1)</th>
                            <th className="px-6 py-4 font-bold text-xs text-center uppercase">Position (Sys)</th>
                            <th className="px-6 py-4 font-bold text-xs text-center uppercase">Statut Arbitrage</th>
                            <th className="px-6 py-4 font-bold text-xs text-right uppercase">Actions Arbitrage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E1DB]">
                        {[
                            { emp: 'S. Traore', mgr: 'A. Diakite', pos: 'STAR', posColor: '#F26322', status: 'En Attente', statusColor: 'orange' },
                            { emp: 'M. Kone', mgr: 'O. Bamba', pos: 'HIGH PERFORMER', posColor: '#463738', status: 'Validé RH', statusColor: 'green' },
                            { emp: 'T. Ndiaye', mgr: 'F. Cisse', pos: 'CORE PLAYER', posColor: '#9A9750', status: 'Ajusté (Calibré)', statusColor: 'blue' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-[#463738] font-bold text-sm">{row.emp}</td>
                                <td className="px-6 py-4 text-[#A39D98] text-sm">{row.mgr}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm opacity-90" style={{ background: row.posColor }}>
                                        {row.pos}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-${row.statusColor}-600 bg-${row.statusColor}-50 px-2 py-1 rounded text-xs font-bold`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-end gap-2">
                                    <button onClick={() => showToast('Ouverture de la matrice pour Arbitrage manuel (Modale 9-Box N+2)...')} className="text-xs px-3 py-1.5 border border-[#463738] text-[#463738] rounded-md font-bold hover:bg-[#463738]/10 transition-colors">
                                        Arbitrer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ─── Vue : Rapport de Pilotage (Site) ──────────────────────────────
    const renderRapportPilotage = () => {
        const statsDepartement = [
            { nom: 'Opérations Minières', effectif: 40, evalues: 40, pourcentage: 100 },
            { nom: 'Maintenance', effectif: 32, evalues: 27, pourcentage: 85 },
            { nom: 'HSEQ', effectif: 24, evalues: 24, pourcentage: 100 },
            { nom: 'Ressources Humaines', effectif: 16, evalues: 16, pourcentage: 100 }
        ];

        const effectifTotal = statsDepartement.reduce((acc, dep) => acc + dep.effectif, 0);
        const effectifEvalue = statsDepartement.reduce((acc, dep) => acc + dep.evalues, 0);
        const ratioGlobal = Math.round((effectifEvalue / effectifTotal) * 100) || 0;

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98]">
                    <span
                        className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors"
                        onClick={() => setViewMode('SITE_ADMIN')}
                    >
                        <Home size={14} className="mb-0.5" /> 🏠 Page d'accueil Site Admin
                    </span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">Rapport de Pilotage Site</span>
                </div>

                <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30">
                    <div>
                        <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-3">
                            <Presentation className="text-[#9A9750]" size={28} /> Rapport de Pilotage Site ({siteScope})
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">Supervisez la conformité et l'avancement de la campagne d'évaluation annuelle pour votre site.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI Glogal */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F26322]/30 flex flex-col justify-center items-center text-center hover:border-[#F26322]/80 transition-all col-span-1">
                        <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide mb-4">Ratio Global Site Évalué</h3>

                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="#F26322" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ratioGlobal) / 100} className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-[#463738]">{ratioGlobal}%</span>
                            </div>
                        </div>
                        <p className="mt-4 font-bold text-[#463738] text-sm">{effectifEvalue} / {effectifTotal} collaborateurs évalués</p>
                    </div>

                    {/* Breakdown par Département */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#A39D98]/20 bg-[#463738]/5">
                            <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                <BarChart2 size={20} className="text-[#9A9750]" /> Effectif & Pourcentage d'Évaluation par Département
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-5">
                                {statsDepartement.map((dep, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-[#463738]">{dep.nom}</span>
                                            <div className="flex items-center gap-4 text-[#A39D98]">
                                                <span>{dep.evalues} / {dep.effectif} évalués</span>
                                                <span className={`px-2 py-0.5 rounded text-xs text-white ${dep.pourcentage === 100 ? 'bg-emerald-600' : dep.pourcentage > 70 ? 'bg-[#9A9750]' : 'bg-red-600'}`}>
                                                    {dep.pourcentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-[#E3E1DB] h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${dep.pourcentage === 100 ? 'bg-emerald-600' : dep.pourcentage > 70 ? 'bg-[#9A9750]' : 'bg-red-600'}`}
                                                style={{ width: `${dep.pourcentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    // ─── Vue : Gestion du Site — déléguée au composant dédié ─────────────
    // ─── Vue : Tableau de bord principal (SITE_ADMIN) ──────────────────────
    const renderSiteAdminMain = () => (
        <>
            {/* Alerte sécurité */}
            <div className="bg-[#9A9750]/10 border border-[#9A9750]/30 rounded-xl px-5 py-3 text-sm text-[#463738] font-medium flex items-center gap-2 mb-6">
                <AlertCircle size={16} className="text-[#9A9750] shrink-0" />
                <span><strong>Interface Administrateur Site</strong> — Cette interface est strictement réservée à votre rôle.</span>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-[28px] font-black text-[#463738]">Tableau de bord — Administrateur Site</h2>
                <p className="text-[#A39D98] text-[15px] mt-1">
                    Bienvenue, <strong className="text-[#463738]">{nomAdmin}</strong>. Voici votre espace de travail personnalisé.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                    { title: 'Country', value: pays, icon: <MapPin size={20} className="text-white" />, dark: true },
                    { title: 'Site', value: siteScope.charAt(0).toUpperCase() + siteScope.slice(1), icon: <Building2 size={20} className="text-white" />, dark: true },
                    { title: 'Site Users', value: `${directTeam.length} utilisateur${directTeam.length > 1 ? 's' : ''}`, icon: <Users size={20} className="text-white" />, dark: true },
                ].map((kpi, i) => (
                    <div key={i} className="bg-[#463738] text-white rounded-2xl p-5 shadow-md flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#E3E1DB]/70 uppercase tracking-wider">{kpi.title}</span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{kpi.icon}</div>
                        </div>
                        <span className="text-[22px] font-black text-white">{kpi.value}</span>
                    </div>
                ))}
            </div>

            {/* Actions principales */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 p-6 mb-6">
                <h3 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                    <User size={18} className="text-[#F26322]" /> Actions principales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gestion du Site */}
                    <button
                        onClick={() => setViewMode('SITE_MGMT')}
                        className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                        style={{ background: 'linear-gradient(135deg, #F26322 0%, #463738 100%)' }}
                    >
                        <Building2 size={22} /> Gestion du Site
                    </button>
                    {/* Équipes */}
                    <button
                        onClick={() => { setViewMode('MY_TEAM'); setTeamSubView('LIST'); }}
                        className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                        style={{ background: 'linear-gradient(135deg, #9A9750 0%, #463738 100%)' }}
                    >
                        <Users size={22} /> Équipes
                    </button>
                    {/* Révisions RH */}
                    <button
                        onClick={() => setViewMode('REVISION_RH')}
                        className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                        style={{ background: 'linear-gradient(135deg, #463738 0%, #F26322 100%)' }}
                    >
                        <CheckSquare size={22} /> Révisions RH
                    </button>
                    {/* Rapport de pilotage */}
                    <button
                        onClick={() => setViewMode('RAPPORT_PILOTAGE')}
                        className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                        style={{ background: 'linear-gradient(135deg, #9A9750 0%, #463738 100%)' }}
                    >
                        <Presentation size={22} /> Rapport de pilotage
                    </button>
                </div>
            </div>

            {/* Pilotage — tableau avancement */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                <div className="p-5 border-b border-[#A39D98]/20 flex justify-between items-center bg-white relative">
                    <h3 className="font-bold text-lg text-[#463738]">État d'avancement par département</h3>
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="text-sm font-bold text-white bg-[#F26322] px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Download size={16} /> Exporter Rapport <ChevronDown size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#A39D98]/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 bg-[#f9f9f9] border-b border-[#eee] text-xs font-bold text-[#A39D98] uppercase">Format d'export</div>
                                <button onClick={() => handleExportReport('Excel')} className="w-full text-left px-4 py-3 hover:bg-[#E3E1DB]/40 text-[#463738] font-bold text-sm flex items-center gap-3 transition-colors">
                                    <FileSpreadsheet size={16} className="text-[#107c41]" /> Exporter en Excel (.xlsx)
                                </button>
                                <button onClick={() => handleExportReport('Word')} className="w-full text-left px-4 py-3 hover:bg-[#E3E1DB]/40 text-[#463738] font-bold text-sm flex items-center gap-3 transition-colors border-t border-[#eee]">
                                    <FileText size={16} className="text-[#2b579a]" /> Exporter en Word (.docx)
                                </button>
                                <button onClick={() => handleExportReport('PowerPoint')} className="w-full text-left px-4 py-3 hover:bg-[#E3E1DB]/40 text-[#463738] font-bold text-sm flex items-center gap-3 transition-colors border-t border-[#eee]">
                                    <Presentation size={16} className="text-[#c43e1c]" /> Exporter en PowerPoint
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-[#E3E1DB]/50 text-[#A39D98]">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase">Département</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase">Effectif</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-center">Auto-Éval</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-center">Éval Manager</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-center">Archives PDF</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E1DB]">
                        {['Opérations Minières', 'Maintenance', 'HSEQ', 'Ressources Humaines'].map((dept, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-[#463738] font-bold">{dept}</td>
                                <td className="px-6 py-4 text-[#A39D98] font-medium">{40 - (i * 8)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded">100%</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={i === 0 ? 'text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded' : 'text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded'}>
                                        {i === 0 ? '75%' : '100%'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={i > 1 ? 'text-red-600 font-bold bg-red-50 px-3 py-1 rounded' : 'text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded'}>
                                        {i > 1 ? '5/20' : 'Complet'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden">
            {toastMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#463738] text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
                    <CheckCircle size={18} className="text-[#9A9750]" />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}
            {showNineBox && <NineBoxModal onClose={() => setShowNineBox(false)} />}
            {/* Topbar */}
            <header className="h-[76px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <NavButtons onPrev={handlePrevView} onNext={handleNextView} />
                    <CoricaLogo className="h-10 w-auto" />
                    <div className="flex flex-col justify-center mr-4">
                        <h1 className="text-[19px] text-[#463738] font-extrabold tracking-tight leading-none uppercase">Talent Quantum <span className="text-[#F26322]">v8.0</span></h1>
                        <p className="text-[10px] text-[#A39D98] font-bold tracking-widest uppercase">Espace Admin Site (RRH)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-[#9A9750]/20 text-[#9A9750] px-3 py-1.5 rounded-md text-xs font-bold shadow-sm border border-[#9A9750]/30">
                        Admin Site / RRH
                    </span>
                    <DownloadGuideButton />
                    <Bell size={20} className="text-[#A39D98] cursor-pointer hover:text-[#F26322] transition-colors mx-2" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#9A9750] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {nomAdmin.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[#463738] font-medium">{nomAdmin}</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span
                        className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors"
                        onClick={() => setViewMode('SITE_ADMIN')}
                    >
                        <Home size={15} className="mb-0.5" /> 🏠 Page d'accueil Site Admin
                    </span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_PROFILE' && 'Mon Profil (Évalué)'}
                        {viewMode === 'MY_TEAM' && 'Mon Équipe Directe'}
                        {viewMode === 'SITE_MGMT' && 'Gestion du Site'}
                        {viewMode === 'SITE_ADMIN' && 'Tableau de bord'}
                        {viewMode === 'REVISION_RH' && 'Révision RH (Comité N+2)'}
                        {viewMode === 'RAPPORT_PILOTAGE' && 'Rapport de Pilotage Site'}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                    <span className="font-bold text-[#A39D98]">Espace :</span>
                    <button
                        onClick={() => setViewMode('MY_PROFILE')}
                        className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_PROFILE' ? 'bg-[#9A9750] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <User size={16} /> Mon Profil
                    </button>
                    <button
                        onClick={() => { setViewMode('MY_TEAM'); setTeamSubView('LIST'); }}
                        className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_TEAM' ? 'bg-[#463738] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Users size={16} /> Mon Équipe
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-1"></div>
                    <button
                        onClick={() => setViewMode('SITE_ADMIN')}
                        className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'SITE_ADMIN' ? 'bg-[#F26322] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <BarChart3 size={16} /> Pilotage Site
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-1"></div>
                    <button
                        onClick={() => setShowNineBox(true)}
                        className="px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-[#463738] to-[#F26322] text-white shadow-md hover:opacity-90"
                    >
                        <BarChart2 size={16} /> 9-Box Talents
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1200px] mx-auto w-full">
                {viewMode === 'SITE_ADMIN' && renderSiteAdminMain()}
                {viewMode === 'MY_TEAM' && renderMyTeam()}
                {viewMode === 'SITE_MGMT' && <SiteManagementView onBack={() => setViewMode('SITE_ADMIN')} />}
                {viewMode === 'MY_PROFILE' && <MyProfileMockup />}
                {viewMode === 'REVISION_RH' && renderRevisionRH()}
                {viewMode === 'RAPPORT_PILOTAGE' && renderRapportPilotage()}
            </main>
        </div>
    );
}
