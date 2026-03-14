import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee } from '@/lib/data';
import { X, User, MapPin, Briefcase, TrendingUp, Save, Clock, FileText, CheckCircle2, History, UserCheck, CheckSquare, Target, Lock } from 'lucide-react';

interface EmployeeDrawerProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Employee) => void;
}

export function EmployeeDrawer({ employee, isOpen, onClose, onSave }: EmployeeDrawerProps) {
    const [formData, setFormData] = useState<Employee | null>(null);

    useEffect(() => {
        if (employee) {
            setFormData({ ...employee });
        }
    }, [employee]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: (name === 'performance' || name === 'potential') ? Number(value) : value
        }));
    };

    const handleSkillChange = (index: number, newLevel: number) => {
        setFormData(prev => {
            if (!prev) return prev;
            const updatedSkills = [...prev.skills];
            updatedSkills[index] = { ...updatedSkills[index], level: newLevel as 1 | 2 | 3 | 4 | 5 };
            return { ...prev, skills: updatedSkills };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const StatusStepper = () => {
        const steps = [
            { id: 'Draft', label: 'Brouillon' },
            { id: 'HR_Review', label: 'Revue RH' },
            { id: 'Director_Validation', label: 'Validation Dir.' },
            { id: 'Closed', label: 'Clôturé' }
        ];

        const currentIndex = steps.findIndex(s => s.id === formData.status);

        return (
            <div className="flex items-center w-full mt-4 mb-2">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 bg-slate-900 ${idx <= currentIndex ? 'border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'border-slate-700 text-slate-500'}`}>
                                {idx < currentIndex ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${idx <= currentIndex ? 'text-orange-400' : 'text-slate-500'}`}>{step.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 -mx-4 ${idx < currentIndex ? 'bg-orange-500' : 'bg-slate-700'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[700px] bg-slate-900 border-l border-white/10 shadow-2xl shadow-black z-50 overflow-y-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                                <FileText className="text-orange-500" size={22} /> Profil de Talent
                            </h2>
                            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 flex-1 bg-[#0b0f19] relative custom-scroll">
                            {/* Employee Summary Card */}
                            <div className="flex items-start gap-6 mb-8 bg-slate-800/40 p-6 rounded-2xl border border-white/5 shadow-sm">
                                <img src={formData.avatarUrl} alt={formData.name} className="w-24 h-24 rounded-full border-4 border-slate-800 hidden sm:block shadow-lg" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1 truncate">{formData.name}</h3>
                                            <p className="text-sm font-bold text-orange-400 truncate tracking-wide">{formData.role}</p>
                                        </div>
                                        <span className="text-xs bg-black/40 text-slate-400 font-bold px-3 py-1 rounded-md border border-white/5">
                                            ID: {formData.id}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-blue-400" /> {formData.department}</span>
                                        <span className="flex items-center gap-1.5"><User size={14} className="text-purple-400" /> Mgr: {formData.manager}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-green-400" /> {formData.location}</span>
                                    </div>
                                </div>
                            </div>

                            <form id="talent-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                                {/* Workflow Status Visualizer */}
                                <section className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                                        <CheckSquare size={18} className="text-orange-400" /> État du Workflow
                                    </h4>
                                    <StatusStepper />
                                    <div className="mt-8 flex flex-col">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Modifier l'étape Actuelle</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm font-bold text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                                            <option value="Draft">Brouillon (Manager)</option>
                                            <option value="HR_Review">Revue RH</option>
                                            <option value="Director_Validation">Validation Directeur</option>
                                            <option value="Closed">Clôturé & Approuvé</option>
                                        </select>
                                    </div>
                                </section>

                                {/* 9-Box Calibration */}
                                <section className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <TrendingUp size={18} className="text-orange-400" /> Calibration 9-Box
                                        </h4>
                                        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded inline-flex items-center gap-1.5 self-start sm:self-auto">
                                            <Lock size={12} />
                                            Accès limité: N+1, N+2, RH
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Performance (Axe X)</label>
                                            <select name="performance" value={formData.performance} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-orange-500 outline-none transition-colors">
                                                <option value={1}>1 - Sous les attentes</option>
                                                <option value={2}>2 - Attentes atteintes / Solide</option>
                                                <option value={3}>3 - Dépasse les attentes / Exceptioniel</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Potentiel (Axe Y)</label>
                                            <select name="potential" value={formData.potential} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-orange-500 outline-none transition-colors">
                                                <option value={1}>1 - Expert dans le rôle</option>
                                                <option value={2}>2 - Évolution possible (1 niveau)</option>
                                                <option value={3}>3 - Haut potentiel (Croissance rapide)</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section className="bg-slate-800/40 p-5 rounded-2xl border border-white/5">
                                        <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                                            <History size={16} className="text-blue-400" /> Historique Performances
                                        </h4>
                                        <ul className="space-y-3">
                                            {formData.history && formData.history.map((h: any, i: number) => (
                                                <li key={i} className="flex justify-between items-center text-sm font-semibold border-b border-white/5 pb-2">
                                                    <span className="text-slate-400">Année {h.year}</span>
                                                    <span className="bg-black/40 text-slate-300 px-2 py-1 rounded text-xs border border-white/5">
                                                        Perf: {h.performance} | Pot: {h.potential}
                                                    </span>
                                                </li>
                                            ))}
                                            {!formData.history?.length && <li className="text-xs text-slate-500 italic">Aucun historique disponible.</li>}
                                        </ul>
                                    </section>

                                    <section className="bg-slate-800/40 p-5 rounded-2xl border border-white/5">
                                        <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                                            <Target size={16} className="text-lime-400" /> Matrice de Compétences
                                        </h4>
                                        <div className="space-y-4">
                                            {formData.skills && formData.skills.map((skill: any, i: number) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                                                        <span>{skill.name}</span>
                                                        <span className="text-orange-400">{skill.level} / 5</span>
                                                    </div>
                                                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-white/5">
                                                        {[1, 2, 3, 4, 5].map(lvl => (
                                                            <div
                                                                key={lvl}
                                                                onClick={() => handleSkillChange(i, lvl)}
                                                                className={`flex-1 min-w-0 cursor-pointer transition-colors border-r border-[#0b0f19] last:border-0 ${lvl <= skill.level ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-transparent hover:bg-slate-700'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {!formData.skills?.length && <p className="text-xs text-slate-500 italic">Compétences non renseignées.</p>}
                                        </div>
                                    </section>
                                </div>

                                <section className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                                        <UserCheck size={18} className="text-purple-400" /> Risque & Succession
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risque de Départ</label>
                                            <select name="retentionRisk" value={formData.retentionRisk} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-orange-500 outline-none">
                                                <option value="Low">Faible</option>
                                                <option value="Medium">Modéré</option>
                                                <option value="High">Élevé</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Impact d'un départ</label>
                                            <select name="impactOfLoss" value={formData.impactOfLoss} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-orange-500 outline-none">
                                                <option value="Low">Faible (Remplaçable)</option>
                                                <option value="Medium">Modéré (Perturbation)</option>
                                                <option value="High">Élevé (Critique)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan de Développement (IDP)</label>
                                            <textarea name="idp" value={formData.idp} onChange={handleChange} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 focus:border-orange-500 outline-none resize-none" placeholder="Objectifs et formations..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan de Succession</label>
                                            <textarea name="successionPlan" value={formData.successionPlan} onChange={handleChange} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 focus:border-orange-500 outline-none resize-none" placeholder="Successeurs potentiels..." />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </div>

                        {/* Sticky Actions Footer */}
                        <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md sticky bottom-0 flex justify-between items-center z-20">
                            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <Clock size={16} className="text-slate-600" /> Maj: {formData.lastReviewDate}
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-transparent border border-slate-700 rounded-md text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors">
                                    Annuler
                                </button>
                                <button form="talent-form" type="submit" className="px-8 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-md text-sm font-bold text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] flex items-center gap-2 transition-all">
                                    <Save size={18} /> Sauvegarder
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
