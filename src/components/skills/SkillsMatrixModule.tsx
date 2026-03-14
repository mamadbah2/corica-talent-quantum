"use client";
import React, { useState } from 'react';
import { UploadCloud, Star, BarChart2, BookOpen, Target, ChevronRight } from 'lucide-react';
import { SkillsImport } from '@/components/skills/SkillsImport';
import { SkillsEvaluation } from '@/components/skills/SkillsEvaluation';
import { SkillsDashboard } from '@/components/skills/SkillsDashboard';
import { SkillsPlanDev } from '@/components/skills/SkillsPlanDev';
import { SkillsCatalogue } from '@/components/skills/SkillsCatalogue';

type SkillsTab = 'dashboard' | 'import' | 'evaluation' | 'plan' | 'catalogue';

const TABS: { id: SkillsTab; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart2, description: 'Vue analytique multi-sites & gaps critiques' },
    { id: 'import', label: 'Employés (2 000)', icon: UploadCloud, description: 'Import Excel & gestion du référentiel employés' },
    { id: 'evaluation', label: 'Évaluation 1-5', icon: Star, description: 'Évaluation individuelle par compétence' },
    { id: 'plan', label: 'Plans Dev.', icon: Target, description: 'Plans de développement individuels & budget' },
    { id: 'catalogue', label: 'Catalogue Formations', icon: BookOpen, description: 'Catalogue formations & inscriptions' },
];

export function SkillsMatrixModule() {
    const [activeTab, setActiveTab] = useState<SkillsTab>('dashboard');
    const current = TABS.find(t => t.id === activeTab)!;

    return (
        <div className="flex flex-col h-full min-h-0 -mx-4 sm:-mx-10 -mt-8 bg-[#F7F6F3]">
            {/* Module Header */}
            <div className="bg-white border-b border-[#A39D98]/20 px-6 sm:px-10 pt-6 pb-0 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-[#A39D98] font-semibold mb-3">
                    <span>CORICA Talent Quantum</span>
                    <ChevronRight size={12} />
                    <span className="text-[#F26322] font-bold">Skills Matrix</span>
                </div>
                <div className="flex items-start justify-between mb-0">
                    <div>
                        <h2 className="text-2xl font-black text-[#463738]">Skills Matrix & Développement</h2>
                        <p className="text-sm text-[#A39D98] mt-0.5">{current.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        2 000 employés actifs · 12 sites · 5 pays
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex gap-0 mt-5 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-[3px] transition-all whitespace-nowrap ${isActive
                                        ? 'border-[#F26322] text-[#F26322] bg-orange-50/60'
                                        : 'border-transparent text-[#A39D98] hover:text-[#463738] hover:border-[#A39D98]/40'
                                    }`}>
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
                {activeTab === 'dashboard' && <SkillsDashboard />}
                {activeTab === 'import' && <SkillsImport />}
                {activeTab === 'evaluation' && <SkillsEvaluation />}
                {activeTab === 'plan' && <SkillsPlanDev />}
                {activeTab === 'catalogue' && <SkillsCatalogue />}
            </div>
        </div>
    );
}
