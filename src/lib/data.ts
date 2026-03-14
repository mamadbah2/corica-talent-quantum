export type PerformanceScore = number; // 0-5
export type PotentialScore = number; // 0-48

export type MetricLevel = 1 | 2 | 3;

export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    position?: string;
    manager: string;
    site: string;
    jobGrade: string;
    seniority: string;
    performanceScoreN: number;
    performanceScoreN1?: number;
    potentialAnswers: number[]; // Array of 16 values (1, 2, or 3)
    evaluationDate?: string;
    status?: 'Pending' | 'Draft' | 'Closed';
    avatarUrl?: string;
    performance?: MetricLevel;
    potential?: MetricLevel;
    retentionRisk?: 'Low' | 'Medium' | 'High';
    impactOfLoss?: 'Low' | 'Medium' | 'High';
    skills?: string[];
    idp?: string;
    successionPlan?: string;
    lastReviewDate?: string;
    history?: any[];
    location?: string;
}

export const GRID_CELLS_CFG = [
    { id: '3-3', title: 'Future Leader', performance: 3, potential: 3 },
    { id: '3-2', title: 'Growth Employee', performance: 2, potential: 3 },
    { id: '3-1', title: 'Enigma', performance: 1, potential: 3 },
    { id: '2-3', title: 'High Impact', performance: 3, potential: 2 },
    { id: '2-2', title: 'Core Employee', performance: 2, potential: 2 },
    { id: '2-1', title: 'Dilemma', performance: 1, potential: 2 },
    { id: '1-3', title: 'Trusted Pro', performance: 3, potential: 1 },
    { id: '1-2', title: 'Effective', performance: 2, potential: 1 },
    { id: '1-1', title: 'Underperformer', performance: 1, potential: 1 }
];

export const POTENTIAL_QUESTIONS = [
    { id: 1, text: "Cette personne fait preuve d'initiative et démontre des performances qui vont au-delà de ce qui est généralement attendu dans son travail." },
    { id: 2, text: "Cette personne démontre une capacité à communiquer et interagir aisément avec des personnes à des niveaux supérieurs et dans différents domaines de l'entreprise." },
    { id: 3, text: "Cette personne performe face à de nouveaux défis et prend des risques calculés pour obtenir des résultats." },
    { id: 4, text: "Cette personne s'adapte rapidement aux changements et influence positivement les autres en période de transition." },
    { id: 5, text: "Cette personne développe continuellement de nouvelles compétences et cherche proactivement du feedback." },
    { id: 6, text: "Cette personne résout des problèmes complexes de manière autonome et apporte des solutions innovantes." },
    { id: 7, text: "Cette personne fait preuve de leadership émotionnel et gère le stress de manière exemplaire." },
    { id: 8, text: "Cette personne démontre un alignement fort avec la culture et les valeurs de l'entreprise." },
    { id: 9, text: "Cette personne contribue activement au développement et au mentorat des autres employés." },
    { id: 10, text: "Cette personne a une vision claire des objectifs globaux et aligne son travail sur la stratégie globale." },
    { id: 11, text: "Cette personne accepte de prendre des responsabilités allant au-delà de sa description de poste initiale." },
    { id: 12, text: "Cette personne maintient un niveau constant d'excellence même sans supervision directe." },
    { id: 13, text: "Cette personne établit et maintient des relations stratégiques avec des partenaires ou clients externes." },
    { id: 14, text: "Cette personne gère activement les priorités contradictoires et délivre dans les délais." },
    { id: 15, text: "Cette personne est force de proposition pour l'amélioration continue des processus existants." },
    { id: 16, text: "Cette personne a l'ambition d'occuper un rôle de direction ou de leadership stratégique." }
];

export function getMatrixCategory(perf: number, potMean: number) {
    let pLevel = perf > 3.5 ? 'HIGH' : perf >= 2 ? 'AVERAGE' : 'LOW';
    let ptLevel = potMean > 3.5 ? 'HIGH' : potMean >= 2 ? 'AVERAGE' : 'LOW';

    if (pLevel === 'HIGH' && ptLevel === 'HIGH') return 'STAR';
    if (pLevel === 'HIGH' && ptLevel === 'AVERAGE') return 'HIGH PERFORMER';
    if (pLevel === 'HIGH' && ptLevel === 'LOW') return 'SOLID PERFORMER';

    if (pLevel === 'AVERAGE' && ptLevel === 'HIGH') return 'HIGH POTENTIAL';
    if (pLevel === 'AVERAGE' && ptLevel === 'AVERAGE') return 'CORE PLAYER';
    if (pLevel === 'AVERAGE' && ptLevel === 'LOW') return 'AVERAGE PERFORMER';

    if (pLevel === 'LOW' && ptLevel === 'HIGH') return 'POTENTIAL GEM';
    if (pLevel === 'LOW' && ptLevel === 'AVERAGE') return 'INCONSISTENT PLAYER';
    if (pLevel === 'LOW' && ptLevel === 'LOW') return 'RISK';

    return 'UNKNOWN';
}

export const MATRIX_CELLS = [
    { id: 'HIGH-LOW', title: 'SOLID PERFORMER', cat: 'SOLID PERFORMER', color: 'bg-[#fbb923]' },
    { id: 'HIGH-AVG', title: 'HIGH PERFORMER', cat: 'HIGH PERFORMER', color: 'bg-[#a5a9ad]' },
    { id: 'HIGH-HIGH', title: 'STAR', cat: 'STAR', color: 'bg-[#ea5d1f]' },

    { id: 'AVG-LOW', title: 'AVERAGE PERFORMER', cat: 'AVERAGE PERFORMER', color: 'bg-[#8ac63f]' },
    { id: 'AVG-AVG', title: 'CORE PLAYER', cat: 'CORE PLAYER', color: 'bg-[#fbb923]' },
    { id: 'AVG-HIGH', title: 'HIGH POTENTIAL', cat: 'HIGH POTENTIAL', color: 'bg-[#a5a9ad]' },

    { id: 'LOW-LOW', title: 'RISK', cat: 'RISK', color: 'bg-[#ea5d1f]' },
    { id: 'LOW-AVG', title: 'INCONSISTENT PLAYER', cat: 'INCONSISTENT PLAYER', color: 'bg-[#8ac63f]' },
    { id: 'LOW-HIGH', title: 'POTENTIAL GEM', cat: 'POTENTIAL GEM', color: 'bg-[#fbb923]' }
];

export const MOCK_HISTORY = [
    { id: '1', date: '21/01/2026', user: 'Anzoumana Diakite', role: 'Sissengue | employee', evaluator: 'Ibouraima Djibo', category: 'CORE PLAYER' },
    { id: '2', date: '07/01/2026', user: 'Test Risk Category', role: 'Sissengué | Technicien Junior', evaluator: 'Ibouraima Djibo', category: 'RISK' },
    { id: '3', date: '07/01/2026', user: 'Test Star Category', role: 'Sissengué | Technicien Senior', evaluator: 'Ibouraima Djibo', category: 'STAR' },
    { id: '4', date: '07/01/2026', user: 'Test 16 Questions', role: 'Sissengué | Technicien', evaluator: 'Ibouraima Djibo', category: 'HIGH PERFORMER' },
    { id: '5', date: '07/01/2026', user: 'Marie Koné', role: 'Sissengué | Technicienne', evaluator: 'Ibouraima Djibo', category: 'STAR' },
];

export function generateMockMatrixData(): Employee[] {
    const data: Employee[] = [];
    const roles = ['Ingénieur', 'Technicien', 'Géologue', 'Manager', 'Directeur'];
    const managers = ['John Smith', 'Sarah Connor', 'Paul Atreides'];
    for (let i = 1; i <= 23; i++) {
        let perf = 0; let pot = 0;
        if (i <= 12) { perf = 4 + Math.random(); pot = 40 + Math.random() * 8; }
        else if (i <= 17) { perf = 3 + Math.random(); pot = 30 + Math.random() * 5; }
        else { perf = 1 + Math.random(); pot = 20 + Math.random() * 5; }

        data.push({
            id: `EMP-${i}`,
            name: `Employé ${i}`,
            department: i % 2 === 0 ? 'Opérations' : 'Ingénierie',
            position: 'Cadre',
            jobGrade: 'L3',
            seniority: '3 ans',
            site: 'Site Alpha',
            location: 'Site Alpha',
            role: roles[i % roles.length],
            manager: managers[i % managers.length],
            performanceScoreN: perf,
            potentialAnswers: Array(16).fill(0).map(() => Math.floor(Math.random() * 3) + 1),
            status: 'Closed',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=EMP-${i}`,
            performance: (Math.floor(perf / 2) + 1) as MetricLevel,
            potential: (Math.floor(pot / 20) + 1) as MetricLevel,
            retentionRisk: 'Low',
            impactOfLoss: 'Medium',
            skills: ['Leadership', 'Technical'],
            history: []
        });
    }
    return data;
}
