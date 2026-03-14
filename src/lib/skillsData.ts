// ============================================================
// CORICA TALENT QUANTUM — Skills Matrix Data Layer
// ============================================================

// ─── Types ───────────────────────────────────────────────────
export type SkillScore = 0 | 1 | 2 | 3 | 4 | 5;
export type TrainingPriority = 'Prioritaire' | 'Élevé' | 'Modéré' | 'Faible';
export type TrainingStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Competence {
  id: string;
  domaine: string;
  description: string;
  niveauRequis: SkillScore;
  categorie: string;
}

export interface Formation {
  id: string;
  titre: string;
  domaine: string;
  dureeJours: number;
  coutUnitaire: number;
  fournisseur: string;
  type: 'Interne' | 'Externe' | 'E-learning' | 'Sur le tas';
  competencesAssociees: string[]; // ids de compétences
}

export interface EvaluationScore {
  competenceId: string;
  score: SkillScore;
  commentaire?: string;
}

export interface PlanDeveloppement {
  competenceId: string;
  formationId?: string;
  priorite: TrainingPriority;
  dateDebut?: string;
  dateFin?: string;
  statut: TrainingStatus;
  budget?: number;
}

export interface SkillsEmployee {
  id: string;
  nom: string;
  fonction: string;
  metier: string;
  departement: string;
  site: string;
  pays: string;
  sexe: 'M' | 'F';
  dateNaissance?: string;
  dateEntree?: string;
  typeContrat: 'CDI' | 'CDD' | 'Interim' | 'Sous-traitant';
  evaluations: EvaluationScore[];
  planDeveloppement: PlanDeveloppement[];
  scoreGlobal?: number;
  gapGlobal?: number;
}

// ─── Référentiel de Compétences CORICA ──────────────────────
export const REFERENTIEL_COMPETENCES: Competence[] = [
  // === PRODUCTION & OPERATIONS ===
  { id: 'C001', domaine: 'Production', description: 'Conduite d\'engins miniers lourds (Dump Truck, ADT)', niveauRequis: 4, categorie: 'Opérations' },
  { id: 'C002', domaine: 'Production', description: 'Opération de pelle hydraulique et chargeurs', niveauRequis: 4, categorie: 'Opérations' },
  { id: 'C003', domaine: 'Production', description: 'Forage et tir (drill & blast)', niveauRequis: 4, categorie: 'Opérations' },
  { id: 'C004', domaine: 'Production', description: 'Lecture de plan de mine et topographie de base', niveauRequis: 3, categorie: 'Opérations' },
  { id: 'C005', domaine: 'Production', description: 'Gestion de la production journalière et reporting', niveauRequis: 3, categorie: 'Opérations' },
  { id: 'C006', domaine: 'Production', description: 'Supervision d\'équipes de production', niveauRequis: 4, categorie: 'Opérations' },
  { id: 'C007', domaine: 'Production', description: 'Gestion du dewatering (pompage des eaux)', niveauRequis: 3, categorie: 'Opérations' },
  { id: 'C008', domaine: 'Production', description: 'Coordination des opérations de concassage', niveauRequis: 3, categorie: 'Opérations' },

  // === MAINTENANCE ===
  { id: 'C009', domaine: 'Maintenance', description: 'Maintenance préventive d\'engins lourds', niveauRequis: 4, categorie: 'Technique' },
  { id: 'C010', domaine: 'Maintenance', description: 'Diagnostic électrique et électronique des engins', niveauRequis: 4, categorie: 'Technique' },
  { id: 'C011', domaine: 'Maintenance', description: 'Soudure et chaudronnerie industrielle', niveauRequis: 3, categorie: 'Technique' },
  { id: 'C012', domaine: 'Maintenance', description: 'Maintenance hydraulique et pneumatique', niveauRequis: 4, categorie: 'Technique' },
  { id: 'C013', domaine: 'Maintenance', description: 'Planification et ordonnancement de maintenance', niveauRequis: 4, categorie: 'Technique' },
  { id: 'C014', domaine: 'Maintenance', description: 'Gestion des pièces de rechange (CMMS/SAP)', niveauRequis: 3, categorie: 'Technique' },
  { id: 'C015', domaine: 'Maintenance', description: 'Maintenance des véhicules légers (LV)', niveauRequis: 3, categorie: 'Technique' },

  // === HSE ===
  { id: 'C016', domaine: 'HSE', description: 'Gestion des risques et analyse HIRA/JSA', niveauRequis: 4, categorie: 'Sécurité' },
  { id: 'C017', domaine: 'HSE', description: 'Investigation des incidents et near-miss', niveauRequis: 4, categorie: 'Sécurité' },
  { id: 'C018', domaine: 'HSE', description: 'Animation des causeries sécurité et formations HSE', niveauRequis: 3, categorie: 'Sécurité' },
  { id: 'C019', domaine: 'HSE', description: 'Audit HSE et conformité réglementaire', niveauRequis: 4, categorie: 'Sécurité' },
  { id: 'C020', domaine: 'HSE', description: 'Gestion des produits chimiques et MSDS', niveauRequis: 3, categorie: 'Sécurité' },

  // === LOGISTIQUE & SUPPLY CHAIN ===
  { id: 'C021', domaine: 'Supply Chain', description: 'Gestion des stocks et inventaires', niveauRequis: 3, categorie: 'Logistique' },
  { id: 'C022', domaine: 'Supply Chain', description: 'Processus d\'approvisionnement et achats', niveauRequis: 3, categorie: 'Logistique' },
  { id: 'C023', domaine: 'Supply Chain', description: 'Logistique transport et douane', niveauRequis: 3, categorie: 'Logistique' },
  { id: 'C024', domaine: 'Supply Chain', description: 'Utilisation de ERP/SAP pour la supply chain', niveauRequis: 3, categorie: 'Logistique' },

  // === RESSOURCES HUMAINES ===
  { id: 'C025', domaine: 'Ressources Humaines', description: 'Droit du travail local (OHADA, législation nationale)', niveauRequis: 4, categorie: 'RH' },
  { id: 'C026', domaine: 'Ressources Humaines', description: 'Gestion de la paie et administration du personnel', niveauRequis: 4, categorie: 'RH' },
  { id: 'C027', domaine: 'Ressources Humaines', description: 'Recrutement et sélection', niveauRequis: 3, categorie: 'RH' },
  { id: 'C028', domaine: 'Ressources Humaines', description: 'Gestion de la performance et évaluation', niveauRequis: 4, categorie: 'RH' },
  { id: 'C029', domaine: 'Ressources Humaines', description: 'Formation et développement des compétences', niveauRequis: 4, categorie: 'RH' },
  { id: 'C030', domaine: 'Ressources Humaines', description: 'Relations sociales et gestion des conflits', niveauRequis: 4, categorie: 'RH' },

  // === FINANCE ===
  { id: 'C031', domaine: 'Finance', description: 'Comptabilité générale (SYSCOHADA)', niveauRequis: 5, categorie: 'Finance' },
  { id: 'C032', domaine: 'Finance', description: 'Comptabilité des opérations minières', niveauRequis: 5, categorie: 'Finance' },
  { id: 'C033', domaine: 'Finance', description: 'Reporting financier et contrôle de gestion', niveauRequis: 5, categorie: 'Finance' },
  { id: 'C034', domaine: 'Finance', description: 'Gestion de la trésorerie et flux de paiement', niveauRequis: 4, categorie: 'Finance' },
  { id: 'C035', domaine: 'Finance', description: 'Fiscalité et réglementations comptables', niveauRequis: 4, categorie: 'Finance' },

  // === MANAGEMENT & LEADERSHIP ===
  { id: 'C036', domaine: 'Leadership', description: 'Leadership et management d\'équipe', niveauRequis: 4, categorie: 'Management' },
  { id: 'C037', domaine: 'Leadership', description: 'Communication et présentation', niveauRequis: 3, categorie: 'Management' },
  { id: 'C038', domaine: 'Leadership', description: 'Gestion de projet', niveauRequis: 3, categorie: 'Management' },
  { id: 'C039', domaine: 'Leadership', description: 'Prise de décision et résolution de problèmes', niveauRequis: 4, categorie: 'Management' },
  { id: 'C040', domaine: 'Leadership', description: 'Développement et coaching des équipes', niveauRequis: 4, categorie: 'Management' },
];

// ─── Catalogue de Formations ──────────────────────────────────
export const CATALOGUE_FORMATIONS: Formation[] = [
  { id: 'F001', titre: 'Conduite Sécurisée Dump Truck CAT 785', domaine: 'Production', dureeJours: 5, coutUnitaire: 850000, fournisseur: 'Caterpillar Training', type: 'Externe', competencesAssociees: ['C001'] },
  { id: 'F002', titre: 'Opération Pelle P&H 4100', domaine: 'Production', dureeJours: 7, coutUnitaire: 1200000, fournisseur: 'Komatsu Mining', type: 'Externe', competencesAssociees: ['C002'] },
  { id: 'F003', titre: 'Drill & Blast — Techniques avancées', domaine: 'Production', dureeJours: 3, coutUnitaire: 650000, fournisseur: 'Orica Training', type: 'Externe', competencesAssociees: ['C003'] },
  { id: 'F004', titre: 'Supervision Production Mine', domaine: 'Production', dureeJours: 4, coutUnitaire: 450000, fournisseur: 'CORICA Interne', type: 'Interne', competencesAssociees: ['C005', 'C006'] },
  { id: 'F005', titre: 'Maintenance Préventive Engins CAT', domaine: 'Maintenance', dureeJours: 5, coutUnitaire: 750000, fournisseur: 'Caterpillar Training', type: 'Externe', competencesAssociees: ['C009', 'C012'] },
  { id: 'F006', titre: 'Diagnostic Électronique Komatsu', domaine: 'Maintenance', dureeJours: 3, coutUnitaire: 580000, fournisseur: 'Komatsu Mining', type: 'Externe', competencesAssociees: ['C010'] },
  { id: 'F007', titre: 'Soudure MIG/MAG et TIG', domaine: 'Maintenance', dureeJours: 5, coutUnitaire: 380000, fournisseur: 'CFOP Abidjan', type: 'Externe', competencesAssociees: ['C011'] },
  { id: 'F008', titre: 'Planification CMMS/SAP PM', domaine: 'Maintenance', dureeJours: 3, coutUnitaire: 420000, fournisseur: 'SAP Training', type: 'Externe', competencesAssociees: ['C013', 'C014'] },
  { id: 'F009', titre: 'Gestion des Risques et HIRA', domaine: 'HSE', dureeJours: 2, coutUnitaire: 280000, fournisseur: 'Bureau Veritas', type: 'Externe', competencesAssociees: ['C016'] },
  { id: 'F010', titre: 'Investigation et Analyse d\'Incidents', domaine: 'HSE', dureeJours: 3, coutUnitaire: 320000, fournisseur: 'IOSH Certified', type: 'Externe', competencesAssociees: ['C017'] },
  { id: 'F011', titre: 'Audit HSE Internal Lead Auditor', domaine: 'HSE', dureeJours: 5, coutUnitaire: 650000, fournisseur: 'Bureau Veritas', type: 'Externe', competencesAssociees: ['C019'] },
  { id: 'F012', titre: 'Gestion des Stocks et ERP', domaine: 'Supply Chain', dureeJours: 3, coutUnitaire: 280000, fournisseur: 'CORICA Interne', type: 'Interne', competencesAssociees: ['C021', 'C024'] },
  { id: 'F013', titre: 'Droit du Travail Afrique Subsaharienne', domaine: 'Ressources Humaines', dureeJours: 3, coutUnitaire: 480000, fournisseur: 'Cabinet Juridique Partenaire', type: 'Externe', competencesAssociees: ['C025'] },
  { id: 'F014', titre: 'Gestion de la Paie et ADP', domaine: 'Ressources Humaines', dureeJours: 2, coutUnitaire: 350000, fournisseur: 'CORICA Interne', type: 'Interne', competencesAssociees: ['C026'] },
  { id: 'F015', titre: 'Leadership & Management d\'Équipe', domaine: 'Leadership', dureeJours: 3, coutUnitaire: 420000, fournisseur: 'CORICA Interne', type: 'Interne', competencesAssociees: ['C036', 'C040'] },
  { id: 'F016', titre: 'Comptabilité SYSCOHADA', domaine: 'Finance', dureeJours: 5, coutUnitaire: 650000, fournisseur: 'SYSCOHADA Institut', type: 'Externe', competencesAssociees: ['C031', 'C032'] },
  { id: 'F017', titre: 'Gestion de Projet PMP', domaine: 'Leadership', dureeJours: 5, coutUnitaire: 980000, fournisseur: 'PMI', type: 'Externe', competencesAssociees: ['C038'] },
  { id: 'F018', titre: 'Communication et Présentation Efficace', domaine: 'Leadership', dureeJours: 2, coutUnitaire: 240000, fournisseur: 'CORICA Interne', type: 'Interne', competencesAssociees: ['C037'] },
];

// ─── Générateur de données réalistes ──────────────────────────
const NOMS_PRENOMS = [
  'Amadou Diallo', 'Fatou Koné', 'Ibrahima Balde', 'Mariama Bah', 'Ousmane Traoré',
  'Aissatou Camara', 'Mamadou Keïta', 'Kadiatou Diallo', 'Seydou Kouyaté', 'Fatoumata Sow',
  'Abou Sidibé', 'Hawa Touré', 'Moussa Sanogo', 'Aminata Diakité', 'Yaya Coulibaly',
  'Oumou Barry', 'Lamine Bakayoko', 'Awa Sogodogo', 'Boubacar Fofana', 'Mariam Sissoko',
  'Kalil Bamba', 'Nathalie Kouassi', 'Jean-Baptiste Koffi', 'Evelyne Yao', 'Michel Djarraga',
  'Claudine Bouaké', 'Henri Dosso', 'Rose Gbagbo', 'Théodore Aboua', 'Patricia Essoh',
  'Adama Ouédraogo', 'Wendyam Kaboré', 'Brahima Sawadogo', 'Clarisse Zongo', 'Justin Compaoré',
  'Germaine Ilboudo', 'Evariste Tiendrébéogo', 'Angèle Yago', 'Lazare Belem', 'Bibata Coulibaly',
  'Souleymane Touré', 'Maminata Kéïta', 'Moustapha Sissoko', 'Kadidiatou Dramé', 'Elhadj Boly',
  'Djénéba Konaré', 'Hamidou Cissé', 'Assita Diallo', 'Daouda Tarbagdo', 'Salamata Ouédraogo',
  'Kofi Mensah', 'Abena Osei', 'Kwame Asante', 'Ama Boateng', 'Nana Darkwa',
  'Akai Lambert', 'Guillaume Tao', 'Pierre Zahiri', 'Honoré Tokaleu', 'Diomandé Abou',
  'Michel Gonkanou', 'Théophile Kakou', 'Seydou Koné', 'Ziki Zahiri', 'Christian Veh',
  'Anzoumana Diakite', 'Issiaka Konate', 'Siaka Djakité', 'Fiacre Tossou', 'Arouna Sankara',
  'Kamoko Koné', 'Issouf Koné', 'Zié Koné', 'Dognimin Coulibaly', 'Lambert Akai',
  'Hamidou Moussa', 'Mamadou Ouattara', 'Théophile Kakou', 'Djamiou Badara', 'Boniface Ettien',
  'Hyacinthe Djaha', 'Kalilou Sanogo', 'Madiara Bamba', 'Issa Soré', 'Bamba Abdoulaye',
  'Francis Koffi', 'David Koné', 'Deepak Kumar', 'Soumaila Ouattara', 'Mel Kawandami',
  'Yoen Myombo', 'Youndou Alain', 'Bah Modibo', 'Amidou Keba', 'Serge Anibie',
  'Blaise Essey', 'Jean-Jacques Kouamanan', 'Etienne Famien', 'Mamadou Traore', 'Koua Jean',
];

const FONCTIONS = [
  'Opérateur Dump Truck', 'Opérateur ADT', 'Opérateur de Pelle', 'Opérateur Grader',
  'Opérateur Bulldozer', 'Opérateur Niveleuse', 'Foreur', 'Aide Foreur', 'Offsider Drilling',
  'Mécanicien Engins', 'Mécanicien LV', 'Mécanicien Senior', 'Électricien Engins',
  'Électricien Senior', 'Soudeur', 'Soudeur Senior', 'Technicien Hydraulique',
  'Chef d\'Équipe Production', 'Superviseur Production', 'Leading Hand Production',
  'Superviseur Maintenance', 'Planificateur Maintenance', 'Superviseur Électrique',
  'Safety Officer', 'Senior Safety Officer', 'Superviseur HSE',
  'Magasinier', 'Magasinier Senior', 'Superviseur Store', 'Dispatcher',
  'Gestionnaire RH', 'Superviseur RH', 'HR Supervisor', 'HR Manager',
  'Project Manager', 'Operations Manager', 'General Manager',
  'Technicien Forage', 'Superviseur Forage', 'Ingénieur des Mines',
  'Fuel Truck Service', 'Pompiste', 'Chauffeur Camion',
  'Comptable', 'Finance Manager', 'Chief Finance Officer',
  'Production Clerk', 'Spotter', 'Service Man',
];

const DEPARTEMENTS = [
  'Production', 'Maintenance', 'HSE', 'Supply Chain & Logistique',
  'Ressources Humaines', 'Finance', 'Administration', 'IT',
];

const SITES_PAYS: { site: string; pays: string }[] = [
  { site: 'Sissengué', pays: 'Côte d\'Ivoire' },
  { site: 'Ity', pays: 'Côte d\'Ivoire' },
  { site: 'Yamoussoukro', pays: 'Côte d\'Ivoire' },
  { site: 'Syama', pays: 'Mali' },
  { site: 'Goulamina', pays: 'Mali' },
  { site: 'Yanfolila', pays: 'Mali' },
  { site: 'Kayes', pays: 'Mali' },
  { site: 'Kouroussa', pays: 'Guinée' },
  { site: 'Essakane', pays: 'Burkina Faso' },
  { site: 'Mana', pays: 'Burkina Faso' },
  { site: 'Windhoek', pays: 'Namibie' },
  { site: 'HQ Abidjan', pays: 'Côte d\'Ivoire' },
];

const CONTRATS: Array<'CDI' | 'CDD' | 'Interim' | 'Sous-traitant'> = ['CDI', 'CDD', 'CDI', 'CDI', 'Sous-traitant'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getScore(seed: number, requiredLevel: number): SkillScore {
  const r = seededRandom(seed);
  // Realistic distribution: most employees around level 2-4
  if (r < 0.10) return 0;
  if (r < 0.20) return 1;
  if (r < 0.45) return 2;
  if (r < 0.75) return 3;
  if (r < 0.92) return 4;
  return 5;
}

// ─── GÉNÉRATION: 2000 Employés ────────────────────────────────
let _cachedEmployees: SkillsEmployee[] | null = null;

export function generateEmployees(): SkillsEmployee[] {
  if (_cachedEmployees) return _cachedEmployees;

  const employees: SkillsEmployee[] = [];

  // Compétences pertinentes par département
  const deptCompetences: Record<string, string[]> = {
    'Production': ['C001', 'C002', 'C003', 'C004', 'C005', 'C006', 'C007', 'C016', 'C036', 'C037'],
    'Maintenance': ['C009', 'C010', 'C011', 'C012', 'C013', 'C014', 'C015', 'C016', 'C036', 'C037'],
    'HSE': ['C016', 'C017', 'C018', 'C019', 'C020', 'C036', 'C037', 'C039'],
    'Supply Chain & Logistique': ['C021', 'C022', 'C023', 'C024', 'C036', 'C037'],
    'Ressources Humaines': ['C025', 'C026', 'C027', 'C028', 'C029', 'C030', 'C036', 'C037', 'C038'],
    'Finance': ['C031', 'C032', 'C033', 'C034', 'C035', 'C036', 'C037'],
    'Administration': ['C036', 'C037', 'C038', 'C039', 'C021'],
    'IT': ['C036', 'C037', 'C038', 'C039'],
  };

  for (let i = 1; i <= 2000; i++) {
    const seed = i * 137;
    const nomIdx = (i - 1) % NOMS_PRENOMS.length;
    const suffix = i > NOMS_PRENOMS.length ? ` ${Math.floor((i - 1) / NOMS_PRENOMS.length) + 1}` : '';
    const nom = NOMS_PRENOMS[nomIdx] + suffix;
    const deptIdx = Math.floor(seededRandom(seed) * DEPARTEMENTS.length);
    const dept = DEPARTEMENTS[deptIdx];
    const fonctionIdx = Math.floor(seededRandom(seed + 1) * FONCTIONS.length);
    const fonction = FONCTIONS[fonctionIdx];
    const siteIdx = Math.floor(seededRandom(seed + 2) * SITES_PAYS.length);
    const { site, pays } = SITES_PAYS[siteIdx];
    const contratIdx = Math.floor(seededRandom(seed + 3) * CONTRATS.length);
    const sexe: 'M' | 'F' = seededRandom(seed + 4) > 0.28 ? 'M' : 'F';

    const competenceIds = deptCompetences[dept] || ['C036', 'C037'];
    const evaluations: EvaluationScore[] = competenceIds.map((cid, cidx) => {
      const comp = REFERENTIEL_COMPETENCES.find(c => c.id === cid)!;
      const score = getScore(seed + cidx * 7, comp?.niveauRequis ?? 3) as SkillScore;
      return { competenceId: cid, score };
    });

    const totalScore = evaluations.reduce((acc, e) => acc + e.score, 0);
    const maxScore = evaluations.length * 5;
    const scoreGlobal = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const totalRequired = evaluations.reduce((acc, e) => {
      const comp = REFERENTIEL_COMPETENCES.find(c => c.id === e.competenceId);
      return acc + (comp?.niveauRequis ?? 3);
    }, 0);
    const gapGlobal = totalRequired - totalScore;

    const planDeveloppement: PlanDeveloppement[] = evaluations
      .filter(e => {
        const comp = REFERENTIEL_COMPETENCES.find(c => c.id === e.competenceId);
        return e.score < (comp?.niveauRequis ?? 3);
      })
      .slice(0, 3)
      .map(e => {
        const comp = REFERENTIEL_COMPETENCES.find(c => c.id === e.competenceId);
        const formation = CATALOGUE_FORMATIONS.find(f => f.competencesAssociees.includes(e.competenceId));
        const gap = (comp?.niveauRequis ?? 3) - e.score;
        const priorite: TrainingPriority = gap >= 3 ? 'Prioritaire' : gap === 2 ? 'Élevé' : 'Modéré';
        const statuses: TrainingStatus[] = ['Planifiée', 'En cours', 'Terminée', 'Planifiée', 'Planifiée'];
        return {
          competenceId: e.competenceId,
          formationId: formation?.id,
          priorite,
          statut: statuses[Math.floor(seededRandom(seed + 99) * statuses.length)],
          budget: formation?.coutUnitaire,
        };
      });

    employees.push({
      id: `EMP-${String(i).padStart(4, '0')}`,
      nom,
      fonction,
      metier: fonction,
      departement: dept,
      site,
      pays,
      sexe,
      dateEntree: `${2015 + Math.floor(seededRandom(seed + 5) * 9)}-${String(randomInt(1, 12)).padStart(2, '0')}-01`,
      typeContrat: CONTRATS[contratIdx],
      evaluations,
      planDeveloppement,
      scoreGlobal,
      gapGlobal,
    });
  }

  _cachedEmployees = employees;
  return employees;
}

// ─── Fonctions analytiques ────────────────────────────────────

export function getEmployeeById(id: string): SkillsEmployee | undefined {
  return generateEmployees().find(e => e.id === id);
}

export function filterEmployees(filters: {
  site?: string;
  pays?: string;
  departement?: string;
  metier?: string;
  search?: string;
}): SkillsEmployee[] {
  let employees = generateEmployees();
  if (filters.site) employees = employees.filter(e => e.site === filters.site);
  if (filters.pays) employees = employees.filter(e => e.pays === filters.pays);
  if (filters.departement) employees = employees.filter(e => e.departement === filters.departement);
  if (filters.metier) employees = employees.filter(e => e.metier === filters.metier);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    employees = employees.filter(e =>
      e.nom.toLowerCase().includes(q) ||
      e.fonction.toLowerCase().includes(q) ||
      e.site.toLowerCase().includes(q)
    );
  }
  return employees;
}

export function getAnalyticsBySite(): { site: string; pays: string; count: number; avgScore: number; criticalGaps: number }[] {
  const employees = generateEmployees();
  const siteMap: Record<string, { pays: string; count: number; totalScore: number; criticalGaps: number }> = {};

  employees.forEach(e => {
    if (!siteMap[e.site]) siteMap[e.site] = { pays: e.pays, count: 0, totalScore: 0, criticalGaps: 0 };
    siteMap[e.site].count++;
    siteMap[e.site].totalScore += e.scoreGlobal ?? 0;
    if ((e.gapGlobal ?? 0) > 10) siteMap[e.site].criticalGaps++;
  });

  return Object.entries(siteMap).map(([site, data]) => ({
    site,
    pays: data.pays,
    count: data.count,
    avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    criticalGaps: data.criticalGaps,
  })).sort((a, b) => b.count - a.count);
}

export function getAnalyticsByDepartement(): { departement: string; count: number; avgScore: number; tauxCouverture: number }[] {
  const employees = generateEmployees();
  const deptMap: Record<string, { count: number; totalScore: number; covered: number }> = {};

  employees.forEach(e => {
    if (!deptMap[e.departement]) deptMap[e.departement] = { count: 0, totalScore: 0, covered: 0 };
    deptMap[e.departement].count++;
    deptMap[e.departement].totalScore += e.scoreGlobal ?? 0;
    if ((e.scoreGlobal ?? 0) >= 60) deptMap[e.departement].covered++;
  });

  return Object.entries(deptMap).map(([departement, data]) => ({
    departement,
    count: data.count,
    avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    tauxCouverture: data.count > 0 ? Math.round((data.covered / data.count) * 100) : 0,
  }));
}

export function getTopGapCompetences(): { competence: Competence; avgGap: number; employeesAffected: number }[] {
  const employees = generateEmployees();
  const compStats: Record<string, { totalGap: number; count: number }> = {};

  employees.forEach(e => {
    e.evaluations.forEach(ev => {
      const comp = REFERENTIEL_COMPETENCES.find(c => c.id === ev.competenceId);
      if (!comp) return;
      const gap = comp.niveauRequis - ev.score;
      if (!compStats[ev.competenceId]) compStats[ev.competenceId] = { totalGap: 0, count: 0 };
      compStats[ev.competenceId].totalGap += gap;
      compStats[ev.competenceId].count++;
    });
  });

  return REFERENTIEL_COMPETENCES
    .filter(c => compStats[c.id])
    .map(c => ({
      competence: c,
      avgGap: compStats[c.id] ? Math.round((compStats[c.id].totalGap / compStats[c.id].count) * 10) / 10 : 0,
      employeesAffected: compStats[c.id]?.count ?? 0,
    }))
    .filter(r => r.avgGap > 0)
    .sort((a, b) => b.avgGap - a.avgGap)
    .slice(0, 10);
}

export const SCORE_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Non évalué', color: 'text-gray-400', bg: 'bg-gray-100' },
  1: { label: 'Aucune connaissance', color: 'text-red-600', bg: 'bg-red-50' },
  2: { label: 'Notions de base', color: 'text-orange-600', bg: 'bg-orange-50' },
  3: { label: 'Avec support', color: 'text-amber-600', bg: 'bg-amber-50' },
  4: { label: 'Autonome', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  5: { label: 'Expert (peut former)', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export const PAYS_LIST = [...new Set(SITES_PAYS.map(s => s.pays))];
export const SITES_LIST = SITES_PAYS.map(s => s.site);
export const DEPARTEMENTS_LIST = DEPARTEMENTS;
export const METIERS_LIST = [...new Set(FONCTIONS)];
