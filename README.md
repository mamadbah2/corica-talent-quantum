# CORICA QUANTUM : RH & 9-BOX TALENT MANAGEMENT

**Documentation Technique d'Architecture Hybride**

## 1. Vue d'Ensemble
L'application *Corica Quantum* a pour objectif de digitaliser le processus d'évaluation de la performance (KPIs) et du potentiel (Matrice 9-Box) pour l'ensemble du groupe minier. Elle est conçue pour être **inclusive**, permettant l'accès aux employés terrains (via Kiosque partagé) et aux cadres (via PC).

---

## 2. Architecture Technique

### 2.1 Approche Hybride & Accessibilité
L'application résout la contrainte matérielle de l'industrie minière par une authentification bimodale :
*   **Mode "Mobile / Terrain (KIOSQUE)" :** Formulaire tactile PWA (*Progressive Web App*) optimisé pour les tablettes en salle des rapports. Il nécessite uniquement le `Matricule` (ex: COR-123) et un `Code PIN` à 4 chiffres (via Numpad intégré) qui s'identifie contre un JWT côté serveur.
*   **Mode "Bureau (DESKTOP)" :** Pour les Managers et membres du CODIR, la connexion exploite un pont OAuth2 avec **Microsoft Azure AD (Outlook)**.

### 2.2 Sécurité Hiérarchique : RLS PostgreSQL
Pour garantir la confidentialité stricte requise, l'architecture repose sur la *Row Level Security (RLS)* native du moteur PostgreSQL :
*   Aucun filtre n'est appliqué manuellement dans le code back-end (risqué).
*   Lorsqu'un **RRH (Site Admin)** interroge la base de données, PostgreSQL renvoie automatiquement et *exclusivement* les données de son `site_id` avec un `job_level` strictement inférieur. 
*   **Super-Admin :** Un rôle exceptionnel (DSI / Group Compliance) permettant de déverrouiller la plateforme ou de générer des logs d'audit.

---

## 3. Workflows Métier & Espaces de Travail
Le système centralise l'expérience à travers le concept **"Mon Profil (Évalué) / Mon Équipe (Évaluateur)"**. Cet aiguillage UX évite aux managers naviguer sur plusieurs applications.

*   **L’Employé (`/employee`) :** Propose et soumet ses KPIs durant la Phase 1. Son interface se fige (en attente N+1).
*   **Le Manager N+1 (`/manager`) :** Valide les objectifs, génère et valide les auto-évaluations, puis assigne ses talents dans la grille 9-Box.
*   **Le RRH (Site Admin) :** Peut basculer d'une vue "Collaborateur évalué" à une vue "Administration de Site" (Statistiques locales et relances).
*   **Le Superviseur N+2 :** L'onglet spécial d'Arbitrage permet d'imposer un ajustement lors d'un désaccord entre un N+1 et un RRH sur un placement 9-Box.
*   **Le Group Admin HQ :** Un dashboard global "Multi-tenant" remontant les KPIs de tous les sites.

---

## 4. Conformité RH : Le Processus "Phygital"
Une spécificité du cahier des charges Corica Mining Services est l'obligation de conservation légale des signatures.
L'application simule donc un pont Phygital :
1.  Génération d'un PDF à partir de la plateforme.
2.  Signature manuscrite externe (Manager et Évalué).
3.  Upload de la Fiche scannée via la modale dynamique qui "scelle" le dossier et notifie l'administration locale.

---

## 5. Design System & Frontend
L'application intègre **strictement** le livrable CSS Corporate :
*   **Primaire :** `#F26322` (Boutons Actions/MFA/Soumission)
*   **Secondaire :** `#463738` (Textes d'interface, Topboards)
*   **Accents :** `#9A9750`
*   **Neutres & Fond :** `#A39D98`, `#E3E1DB`

**Dépendances Front :** Framework Next.js, composant Canvas complexe (Drag & Drop `@dnd-kit/core`), Tailwind CSS natif.
