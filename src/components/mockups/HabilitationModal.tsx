"use client";

import React, { useState } from 'react';
import { X, Search, Check, Globe, Shield, User, ChevronDown, Lock } from 'lucide-react';
import { ALL_USERS, CoricaUser } from '@/context/UserContext';

interface Habilitation {
    id: string;
    userId: number;
    userEmail: string;
    userName: string;
    role: 'Administrateur Pays' | 'Admin Site' | 'Auditeur' | 'RH Groupe';
    perimeters: string[];
    level: 'read' | 'edit' | 'validate';
    createdAt: string;
}

interface HabilitationModalProps {
    habilitation: Habilitation | null;
    onClose: () => void;
    onSave: (hab: Partial<Habilitation>) => void;
}

const ROLES = ['Administrateur Pays', 'Admin Site', 'Auditeur', 'RH Groupe'] as const;
const PERIMETERS = ['Cote d\'Ivoire', 'Sénégal', 'Guinée', 'Sissengue', 'Ity', 'Yamoussoukro', 'Abidjan', 'HQ Corporate'];
const LEVELS = [
    { id: 'read', label: 'Lecture Seule', desc: 'Peut voir les données sans modifier' },
    { id: 'edit', label: 'Édition & RH', desc: 'Peut modifier les infos et relancer' },
    { id: 'validate', label: 'Validation Totale', desc: 'Peut valider ou override les étapes' }
] as const;

export function HabilitationModal({ habilitation, onClose, onSave }: HabilitationModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<CoricaUser | null>(
        habilitation ? ALL_USERS.find(u => u.id_usercount === habilitation.userId) || null : null
    );
    const [selectedRole, setSelectedRole] = useState(habilitation?.role || 'Administrateur Pays');
    const [selectedPerimeters, setSelectedPerimeters] = useState<string[]>(habilitation?.perimeters || []);
    const [selectedLevel, setSelectedLevel] = useState(habilitation?.level || 'read');

    const filteredUsers = ALL_USERS.filter(u => 
        u.nom_prenoms.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.usercount.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const togglePerimeter = (p: string) => {
        setSelectedPerimeters(prev => 
            prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
        );
    };

    const handleSave = () => {
        if (!selectedUser) {
            alert("Veuillez sélectionner un collaborateur");
            return;
        }
        if (selectedPerimeters.length === 0) {
            alert("Veuillez sélectionner au moins un périmètre");
            return;
        }

        onSave({
            userId: selectedUser.id_usercount,
            userName: selectedUser.nom_prenoms,
            userEmail: selectedUser.usercount,
            role: selectedRole,
            perimeters: selectedPerimeters,
            level: selectedLevel
        });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#463738]/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-[#463738] px-8 py-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F26322] rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Habilitation Administrateur</h2>
                            <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Gestion des droits d'accès délégués</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8F7F4]">
                    
                    {/* Section 1: Cible (Utilisateur) */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#A39D98] uppercase tracking-widest ml-1">Collaborateur Cible</label>
                        {selectedUser && !habilitation ? (
                            <div className="bg-[#463738]/5 border border-[#463738]/10 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#463738] shadow-sm">
                                        {selectedUser.nom_prenoms[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#463738] text-sm">{selectedUser.nom_prenoms}</p>
                                        <p className="text-xs text-[#A39D98]">{selectedUser.usercount}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-[#A39D98] hover:text-red-500 text-xs font-bold uppercase underline">Changer</button>
                            </div>
                        ) : habilitation ? (
                            <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-3 opacity-60">
                                <User size={20} className="text-[#A39D98]" />
                                <span className="font-bold text-[#463738] text-sm">{habilitation.userName}</span>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A39D98]" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher par nom ou email..."
                                    className="w-full bg-white border border-[#463738]/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F26322]/20 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && filteredUsers.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 divide-y divide-gray-50">
                                        {filteredUsers.map(user => (
                                            <button 
                                                key={user.id_usercount}
                                                onClick={() => { setSelectedUser(user); setSearchTerm(''); }}
                                                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="font-bold text-[#463738] text-sm group-hover:text-[#F26322] transform transition-transform group-hover:translate-x-1">{user.nom_prenoms}</p>
                                                    <p className="text-[10px] text-[#A39D98]">{user.usercount} • {user.pays}</p>
                                                </div>
                                                <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Rôle */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#A39D98] uppercase tracking-widest ml-1">Rôle de l'administrateur</label>
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-3 rounded-xl border text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 ${selectedRole === role ? 'bg-[#463738] text-white border-[#463738] shadow-md' : 'bg-white text-[#463738] border-[#463738]/10 hover:border-[#F26322]/30'}`}
                                >
                                    {selectedRole === role && <Check size={14} />} {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Périmètre Multi-select */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#A39D98] uppercase tracking-widest ml-1">Périmètre Géographique d'Intervention</label>
                        <div className="bg-white border border-[#463738]/10 rounded-2xl p-4 flex flex-wrap gap-2 shadow-sm">
                            {PERIMETERS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => togglePerimeter(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${selectedPerimeters.includes(p) ? 'bg-[#9A9750] text-white border-[#9A9750] shadow-sm' : 'bg-gray-50 text-[#A39D98] border-gray-100'}`}
                                >
                                    <Globe size={12} /> {p}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-[#A39D98] italic ml-1">Sélectionnez les pays ou sites spécifiques gérés par cet admin.</p>
                    </div>

                    {/* Section 4: Niveau d'Intervention */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#A39D98] uppercase tracking-widest ml-1">Autorité & Niveau de Contrôle</label>
                        <div className="space-y-2">
                            {LEVELS.map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => setSelectedLevel(level.id)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${selectedLevel === level.id ? 'bg-[#F26322]/5 border-[#F26322]' : 'bg-white border-[#463738]/10 hover:border-[#463738]/30'}`}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedLevel === level.id ? 'bg-[#F26322] text-white' : 'bg-gray-100 text-[#A39D98]'}`}>
                                            {selectedLevel === level.id ? <Check size={16} /> : <Lock size={16} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${selectedLevel === level.id ? 'text-[#F26322]' : 'text-[#463738]'}`}>{level.label}</p>
                                            <p className="text-[10px] text-[#A39D98]">{level.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLevel === level.id ? 'border-[#F26322]' : 'border-gray-200'}`}>
                                        {selectedLevel === level.id && <div className="w-2.5 h-2.5 bg-[#F26322] rounded-full"></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer buttons */}
                <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl font-black text-sm text-[#463738] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-[#463738] text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Enregistrer Habilitation
                    </button>
                </div>

            </div>
        </div>
    );
}
