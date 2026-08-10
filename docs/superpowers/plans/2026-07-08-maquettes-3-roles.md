# Maquettes 3 rôles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire les maquettes statiques HTML/CSS/JS complètes des 3 rôles (Employé, Manager N+1, RH Pays) reproduisant fidèlement l'app codée, ré-habillées au design system verrouillé, pour démontrer l'utilité de Talent Quantum.

**Architecture :** Écrans HTML statiques organisés par rôle sous `maquettes/`, partageant `assets/app.css` (design system verrouillé). Chaque vue/modale codée = un écran navigable au rail. Données réalistes en dur, fil narratif Anzoumana → Mamadou → Blaise. Aucune ressource externe (intranet/air-gap).

**Tech Stack :** HTML5, CSS (design system `app.css` existant, tokens OKLCH), vanilla JS pour interactions légères (repli rail, onglets, ouverture modales). Vérification via Playwright MCP (rendu + screenshot).

## Global Constraints

- **Fidélité stricte au code** : ne reproduire QUE ce qui est câblé sur `/employee`, `/manager`, `/country-admin`. Ne rien ajouter, ne rien retirer. Source de vérité = les fichiers `src/` cités par tâche + `docs/superpowers/specs/2026-07-08-maquettes-3-roles-design.md`.
- **Statique** : non fonctionnel, données réalistes en dur. JS limité à repli rail / onglets / affichage-masquage.
- **Design system verrouillé** : réutiliser `maquettes/assets/app.css`. Palette neutres chauds + orange-actions, polices Anton (titres) / Archivo (corps), **tout carré (`--r-*: 0`)**, rail rétractable. Extensions CSS uniquement si un pattern manque, dans l'esprit du système.
- **100 % local** : aucune police/CSS/JS/img externe. Pas de CDN.
- **Exclus** (ne jamais maquetter) : `NineBoxGrid`, `EmployeeTable`, `EmployeeDrawer`, `DashboardCards`, `Sidebar`, `SkillsMatrixModule`, `SiteManagementView`, `HabilitationModal`, `GRCReportPreview`.
- **Personas fil narratif** : Employé = Anzoumana Diakite (10057, PRODUCTION, Sissengué) ; Manager = Mamadou Traore (10056, PROJECT MANAGER, Sissengué, équipe 10057→10065) ; RH Pays = Blaise Bonzou Essey (10053, COUNTRY HR MANAGER, Côte d'Ivoire). Campagne « Campagne 2026 ».

---

## Phase 0 — Socle partagé

### Task 0.1 : Structure de dossiers + shell rail réutilisable

**Files:**
- Create: `maquettes/employe/`, `maquettes/manager/`, `maquettes/rh-pays/`, `maquettes/partages/` (dossiers)
- Create: `maquettes/_shell.html` (gabarit de référence : structure `.app` + `.rail` + `.topbar` + `.content`, avec le JS de repli du rail)
- Reference: `maquettes/dashboard.html` (structure rail existante), `maquettes/assets/app.css`

**Interfaces:**
- Produces: un gabarit HTML canonique (doctype, `<head>` avec `<link rel="stylesheet" href="../assets/app.css">`, structure `.app`/`.rail`/`.content`, script repli rail) que toutes les tâches d'écran copient et remplissent.

- [ ] **Step 1 : Copier la structure rail depuis un écran existant**
  Lire `maquettes/dashboard.html`, extraire la structure `.app > .rail + .content` et le `<script>` de repli (`.rail__toggle` → toggle `.is-collapsed` sur `.app`). Créer `maquettes/_shell.html` avec cette ossature vide (rail brand centré déjà en place via `.rail__brand`), chemins CSS/fonts en `../assets/`.

- [ ] **Step 2 : Vérifier le rendu du shell**
  Ouvrir `maquettes/_shell.html` avec Playwright, screenshot. Attendu : rail brun à gauche (logo + « Talent Quantum » centrés), zone contenu vide à droite, repli fonctionnel au clic sur le bouton réduire.

- [ ] **Step 3 : Recenser les gaps de patterns CSS**
  Comparer les besoins du spec (§5) aux classes existantes de `app.css`. Lister par écrit les patterns manquants éventuels : jauge circulaire SVG, carte « campagne active », fil d'Ariane, bloc « fiche PDF officielle », frise de blocage. Ne rien coder encore — la liste guide les extensions ponctuelles dans les tâches concernées.

### Task 0.2 : Extensions CSS ponctuelles (si nécessaires)

**Files:**
- Modify: `maquettes/assets/app.css` (ajouts en fin de fichier, section « Patterns rôles »)

**Interfaces:**
- Consumes: liste des gaps de Task 0.1.
- Produces: classes utilitaires nouvelles (ex. `.gauge`, `.campaign-card`, `.breadcrumb`, `.eval-sheet`, `.lock-state`) si et seulement si un besoin réel n'est pas couvert.

- [ ] **Step 1 : Ajouter uniquement les patterns manquants identifiés**
  Pour chaque gap confirmé en 0.1-Step3, écrire la classe correspondante en respectant tokens et « tout carré ». Si un besoin est en fait couvert par un pattern existant, ne rien ajouter (DRY).

- [ ] **Step 2 : Vérifier la cohérence visuelle**
  Ouvrir un écran de démonstration minimal utilisant les nouvelles classes avec Playwright, screenshot. Attendu : styles cohérents avec le reste (carré, palette, Anton/Archivo).

---

## Phase 1 — 👤 Rôle Employé (premier livrable, checkpoint à la fin)

> Réf. code : `src/app/employee/page.tsx`, `src/components/mockups/MyProfileMockup.tsx`, `src/components/skills/EmployeeSkillsPersonal.tsx`, `src/components/NotificationBell.tsx`. Rail readapté : items = les 5 entrées d'accueil.

### Task 1.1 : Accueil Employé

**Files:**
- Create: `maquettes/employe/accueil.html`
- Reference: `src/app/employee/page.tsx` (vue `null`, topbar, tuiles)

**Interfaces:**
- Produces: rail employé (nav vers profil/objectifs/evaluation/dashboard/competences), topbar (titre « Mon Profil » + sous-titre, avatar Anzoumana, cloche, déconnexion).

- [ ] **Step 1 : Construire l'écran**
  Copier `_shell.html`. Rail : items « Mon Profil », « Mes objectifs de performance », « Mon auto-évaluation », « Dashboard de l'Employé », « Mes Compétences & Formation » (icônes cohérentes). Contenu : en-tête « Mon Profil » + sous-titre « Gérez votre profil, vos objectifs de performance et vos évaluations. » ; section « Actions principales » avec les 5 `.role-card` liant chaque écran. Topbar avec avatar « Anzoumana Diakite » + `.notif-panel` déclenchable.

- [ ] **Step 2 : Vérifier**
  Playwright : ouvrir `accueil.html`, screenshot. Attendu : 5 tuiles cliquables, rail cohérent, aucune ressource externe (vérifier via `browser_network_requests` qu'aucune requête ne sort). Comparer les libellés à `page.tsx`.

### Task 1.2 : Mon Profil

**Files:**
- Create: `maquettes/employe/profil.html`
- Reference: `src/app/employee/page.tsx` (vue `PROFILE`) / `MyProfileMockup.tsx`

- [ ] **Step 1 : Construire les 4 cartes**
  Carte 1 Informations Personnelles : zone photo (« Télécharger votre photo ici ! », note « Formats acceptés : JPG, PNG, WEBP — Max 5 Mo »), champs Matricule (readonly, `10057`), Nom et Prénoms, Date de Naissance, Email professionnel, Numéro de Téléphone. Carte 2 Informations Professionnelles : Fonction (« EMPLOYE »), Date d'Embauche, Pays (Côte d'Ivoire), Site (Sissengué), Département (PRODUCTION), Service. Carte 3 Manager Direct N+1 (Mamadou Traore — PROJECT MANAGER). Carte 4 Manager N+2. Footer : « Retour Menu » + « Enregistrer les modifications ». Utiliser `.field`/`.input`/`.grid-2`.

- [ ] **Step 2 : Vérifier**
  Playwright screenshot. Attendu : 4 cartes à bordures colorées, champs readonly grisés (Matricule), données Anzoumana cohérentes.

### Task 1.3 : Mes Objectifs de performance

**Files:**
- Create: `maquettes/employe/objectifs.html`
- Reference: `src/app/employee/page.tsx` (vue `OBJECTIVES`)

- [ ] **Step 1 : Construire la table + footer**
  Table (en-tête vert `#2B5C3F` → token équivalent) colonnes : Nom Objectif, Description, Critères de mesure, Délai, Poids %, Actions (corbeille). Pré-remplir 2-3 objectifs réalistes de production (total poids = 100 %). Zone « Commentaires de l'Employé (optionnel) ». Footer `.statstrip`-like : « N objectif(s) • Total poids: 100% » (olive), boutons « Enregistrer », « Imprimer Fiche », « Soumettre au Manager ». Prévoir aussi l'état vide « Aucun objectif saisi » (commenté ou second fichier de démonstration).

- [ ] **Step 2 : Vérifier**
  Playwright screenshot. Attendu : total poids affiché 100 % en olive ; bouton Soumettre actif. Comparer colonnes/labels au code.

### Task 1.4 : Mon Auto-évaluation (+ état verrouillé)

**Files:**
- Create: `maquettes/employe/evaluation.html`
- Reference: `src/app/employee/page.tsx` (vue `EVALUATION`), `MyProfileMockup.tsx` (état bloqué)

- [ ] **Step 1 : Construire la table d'auto-évaluation**
  Colonnes : Objectifs, Description de l'Objectif (KPI), Mesure, Échéance (« 31/12/2026 »), Évaluation (`.rating` 4 étoiles, labels Faible/Passable/Bon/Excellent), Livrables (zone « Joindre Fichier »), Commentaires. Carte synthèse : « Note moyenne de l'Auto-évaluation » /4 + « Objectifs évalués X/N ». Footer : « Sauvegarder » / « Soumettre l'évaluation ».

- [ ] **Step 2 : Construire l'état verrouillé**
  Dans le même fichier (bloc masquable) ou variante : écran « Auto-Évaluation non disponible » (cadenas), message d'attente validation N+1 / période, frise `.stepper` (① rédaction → ② attente validation N+1 → ③ auto-éval → ④ éval N+1 → ⑤ calibration N+2).

- [ ] **Step 3 : Vérifier**
  Playwright : screenshot des deux états. Attendu : étoiles cliquables au rendu, frise cohérente, labels conformes.

### Task 1.5 : Dashboard & Data Vault

**Files:**
- Create: `maquettes/employe/dashboard.html`
- Reference: `src/app/employee/page.tsx` (vue `DASHBOARD`)

- [ ] **Step 1 : Construire les 4 modules**
  (A) BarChart « Évolution des Évaluations (Trimestriel) » — rendu en SVG/CSS statique (barres « Mes Notes » orange vs « Moy. Département » olive, axe 0→4). (B) Donut « Répartition des Objectifs » (Atteints/En Cours/Non Atteints) en SVG. (C) Module « Résultats de mon Évaluation N+1 » : table (Objectif, Mon Auto-Éval., Note N+1, Résultat badge, Écart) + bandeau « Évalué par : Mamadou Traore ». (D) « Mon Coffre-Fort Numérique » : 3 cartes verrouillées dont « Matrice 9-Box Historique — Accès restreint aux Administrateurs ». (E) « Suivi des Actions (Plan d'Action) » : table Action/Objectif Lié/Échéance/Statut/Notes avec badges Terminé/En Cours/À Venir.

- [ ] **Step 2 : Vérifier**
  Playwright screenshot. Attendu : graphiques statiques lisibles, cartes coffre-fort grisées/verrouillées, badge « Accès Confidentiel ».

### Task 1.6 : Mes Compétences & Formation

**Files:**
- Create: `maquettes/employe/competences.html`
- Reference: `src/components/skills/EmployeeSkillsPersonal.tsx`, `src/lib/skillsData.ts`

- [ ] **Step 1 : Onglet « Mes Compétences »**
  En-tête : nom · fonction · site + encart « SCORE GLOBAL » %. 3 KPI (Compétences évaluées, Niveau requis atteint, À développer). Référentiel département PRODUCTION : lignes `.skillrow` avec badge id (C001…), domaine, badge « Gap −N » ou « ✓ Niveau atteint », `.lvl` barre + repère requis, auto-éval `.rating` 4 étoiles. Légende échelle 1-4 (Initial/Apprenti, Opérationnel, Avancé/Maîtrise, Expert/Formateur).

- [ ] **Step 2 : Onglet « Formations & Plan de Développement »**
  Plan par compétence en gap (badges priorité Prioritaire/Élevé/Modéré + statut), encart formation liée (jours · fournisseur · type · K FCFA). Liste « Formations disponibles — PRODUCTION » depuis le catalogue (titre, durée, fournisseur, coût K FCFA, badge type, pastille « Dans votre plan »).

- [ ] **Step 3 : Vérifier**
  Playwright : screenshot des 2 onglets (bascule JS). Attendu : matrice compétences lisible, gaps colorés, catalogue cohérent.

### Task 1.7 : Checkpoint Employé

- [ ] **Step 1 : Revue d'ensemble du rôle**
  Ouvrir les 6 écrans à la suite via Playwright, vérifier : navigation au rail cohérente entre écrans, fil narratif Anzoumana partout, zéro requête réseau externe, fidélité aux libellés du code. Corriger les écarts.
- [ ] **Step 2 : Mettre à jour `index.html`** avec une entrée « Rôle Employé » listant les 6 écrans.
- [ ] **Step 3 : Présenter à l'utilisateur pour validation avant d'attaquer le Manager.**

---

## Phase 2 — 👔 Rôle Manager N+1 (checkpoint à la fin)

> Réf. code : `src/app/manager/page.tsx`, `MyTeamMockup.tsx`, `TeamSkillsMatrixView.tsx`, `NineBoxModal.tsx`. Rail readapté : Mon Équipe, 9-Box, Matrice Compétences, Rapports, Inbox, Mon Profil.

### Task 2.1 : Mon Équipe Directe
**Files:** Create `maquettes/manager/equipe.html` · Reference `MyTeamMockup.tsx` (TEAM)
- [ ] **Step 1 :** Table colonnes Collaborateur (nom + email), Fonction, Statut Campagne (badges NOT_STARTED/KPI_SUBMITTED/KPI_APPROVED/N1_EVAL_DONE/COMPLETED), Actions (bouton selon étape : Réviser KPIs / Évaluer / Voir résultats / Dossier + Historique). 9 collaborateurs 10057→10065, statuts mélangés (id%4). Sous-titre « 9 collaborateurs · Campagne 2026 en cours ».
- [ ] **Step 2 :** Playwright screenshot. Attendu : 9 lignes, statuts colorés distincts, bon bouton d'action par statut.

### Task 2.2 : Réviser KPIs
**Files:** Create `maquettes/manager/reviser-kpis.html` · Reference `ModalReviewKpis`
- [ ] **Step 1 :** Écran (ex-modale) accent ambre. Cartes objectif éditables (Nom, Description, Critères de mesure, Délai, Poids %) + bouton Valider par carte, barre « X/N validés », « Poids total », bouton « Valider & Notifier l'Employé ». Contexte : objectifs d'Anzoumana.
- [ ] **Step 2 :** Playwright screenshot. Attendu : cartes objectif, état « validé » distinct, poids total.

### Task 2.3 : Évaluer
**Files:** Create `maquettes/manager/evaluer.html` · Reference `ModalEvaluer`
- [ ] **Step 1 :** 2 tables (Auto-évaluation employé lecture seule bandeau vert + Votre évaluation N+1 bandeau orange, colonnes Objectifs/Description KPI/Mesure/Échéance/Évaluation étoiles/Livrables/Commentaires). Pieds « Note moyenne » /4. Blocs « Commentaires Manager » + « Besoins en Formation » (liste + Ajouter). Footer Annuler/Imprimer/Soumettre.
- [ ] **Step 2 :** Playwright screenshot. Attendu : 2 tables distinctes, étoiles pleines (employé) vs cliquables (N+1).

### Task 2.4 : Voir résultats (fiche PDF officielle)
**Files:** Create `maquettes/manager/resultats.html` · Reference `ModalVoirEval`
- [ ] **Step 1 :** Reproduire la fiche « CORICA MINING SERVICES — Formulaire d'Évaluation de Performance » : Informations de l'Employé (8 champs), Informations du Manager Évaluateur (3), Période et Date d'Évaluation, Évaluation du Manager (table + badges X/4), Commentaires Employé, Commentaires Manager, Demande de Formation, 3 signatures. Boutons Télécharger PDF / Fermer.
- [ ] **Step 2 :** Playwright screenshot. Attendu : mise en page « document officiel », sections encadrées, 3 zones de signature.

### Task 2.5 : Dossier / Signatures
**Files:** Create `maquettes/manager/dossier-signatures.html` · Reference `ModalSignatures`
- [ ] **Step 1 :** Zone d'upload pointillés (« Upload du document signé », « Concerne : Anzoumana Diakite », note double signature, badge OCR), bouton « Valider l'Upload et Notifier RH » + écran succès « Document Conforme & Transmis ! ».
- [ ] **Step 2 :** Playwright screenshot. Attendu : zone upload + état succès.

### Task 2.6 : Rapports & Statistiques
**Files:** Create `maquettes/manager/rapports.html` · Reference `MyTeamMockup` (REPORTS)
- [ ] **Step 1 :** BarChart statique « État des Objectifs (KPIs) » (Soumis vs Attente), « Avancement Global » par collaborateur (barres colorées + %), bandeau « Résumé Global » (« X dossiers finalisés sur 9 »).
- [ ] **Step 2 :** Playwright screenshot. Attendu : barres lisibles, résumé cohérent.

### Task 2.7 : Matrice Compétences équipe
**Files:** Create `maquettes/manager/competences-equipe.html` · Reference `TeamSkillsMatrixView.tsx`
- [ ] **Step 1 : Onglets Matrice + Évaluation**
  En-tête « Skills Matrix — Mon Équipe » + KPI Gaps critiques / Score moyen. Onglet Matrice : `.matrix` collaborateurs × compétences (cellules colorées `.lvl`, ligne « Moyenne équipe », légende). Onglet Évaluer : liste collaborateurs + panneau détail (échelle 1-4, compétences par domaine repliables, boutons 1-4).
- [ ] **Step 2 : Onglets Gaps + Formations**
  Gaps & Priorités (par compétence : gap moyen, N collaborateurs sous requis, formation recommandée + budget FCFA). Formations disponibles (catalogue département).
- [ ] **Step 3 :** Playwright screenshot des 4 onglets. Attendu : matrice complète, 4 onglets fonctionnels (JS).

### Task 2.8 : Inbox & Approbations
**Files:** Create `maquettes/manager/inbox.html` · Reference `MyTeamMockup` (INBOX)
- [ ] **Step 1 :** Approbations en attente (cartes ambre KPI soumis + bouton Réviser KPIs) + Notifications (`.notif-item` typées, Tout marquer lu). État vide « Aucune notification ».
- [ ] **Step 2 :** Playwright screenshot. Attendu : 2 zones, notifications typées colorées.

### Task 2.9 : Mon Profil (manager)
**Files:** Create `maquettes/manager/profil.html` · Reference `MyTeamMockup` (PROFILE)
- [ ] **Step 1 :** Avatar Mamadou + champs lecture seule Département, Grade, Site, Pays, Email, Interface. Note « Pour modifier votre profil… ».
- [ ] **Step 2 :** Playwright screenshot.

### Task 2.10 : Écran partagé — 9-Box Talent Matrix
**Files:** Create `maquettes/partages/9box.html` · Reference `NineBoxModal.tsx`, `src/lib/data.ts`
- [ ] **Step 1 : Onglet Nouvelle Évaluation**
  Select employé, Note Performance Année N (1-4) + N-1 optionnelle, section « Évaluation du Potentiel (16 critères) » : reprendre **littéralement** les 16 `POTENTIAL_QUESTIONS`, groupées Agilité (1-7) / Aspiration (8-11) / Motivation & Engagement (12-16), boutons Faible/Passable/Bon/Excellent, compteur X/16.
- [ ] **Step 2 : Onglet Dashboard 9-Box**
  Filtres (Department, Position, Job Grade, Seniority, Site). `.nb-grid` 3×3 axes PERFORMANCE (HIGH/AVERAGE/LOW) × POTENTIAL (LOW/AVERAGE/HIGH), 9 catégories `MATRIX_CELLS` (STAR, HIGH PERFORMER, SOLID PERFORMER, HIGH POTENTIAL, CORE PLAYER, AVERAGE PERFORMER, POTENTIAL GEM, INCONSISTENT PLAYER, RISK) avec compteur + %, panneau latéral liste employés. Mapper couleurs catégories aux tokens `--star/core/grow/warn/risk`.
- [ ] **Step 3 : Onglet Historique + Personnalisation**
  Historique : cartes (employé, catégorie colorée, date, évaluateur). Écran Personnalisation : couleurs des 9 cases + pondération Y/X (sliders) + notice « Mode Démo ».
- [ ] **Step 4 :** Playwright screenshot des 3 onglets. Attendu : 16 questions présentes et exactes, grille 3×3 avec 9 catégories nommées, couleurs cohérentes design system.

### Task 2.11 : Checkpoint Manager
- [ ] **Step 1 :** Revue des 9 écrans + 9-box : navigation rail, fil narratif (équipe de Mamadou = 10057→10065), fidélité, zéro requête externe.
- [ ] **Step 2 :** Mettre à jour `index.html` (entrée « Rôle Manager »).
- [ ] **Step 3 :** Présenter à l'utilisateur pour validation.

---

## Phase 3 — 🌍 Rôle RH Pays / Coordinateur (checkpoint à la fin)

> Réf. code : `src/app/country-admin/page.tsx`, `CountryManagementView.tsx`. Réutilise 9-box (2.10), Mon Profil (1.2), Mon Équipe (2.1). Rail readapté : Pilotage Pays, Rapport Pays, Gestion Bureau, 9-Box, Mon Équipe, Mon Profil.

### Task 3.1 : Pilotage Pays
**Files:** Create `maquettes/rh-pays/pilotage.html` · Reference `country-admin/page.tsx` (COUNTRY_ADMIN)
- [x] **Step 1 :** Bandeau périmètre « 🇨🇮 Côte d'Ivoire (Sissengué, Ity, Yamoussoukro, Abidjan) ». 4 KPI (Sites Supervisés, Total Talents + « objectifs soumis », Avancement Global ×2 avec barre). Carte « Campagne d'Évaluation Active » **lecture seule** (statut Programmée/En cours ✓/Clôturée + encart Lock « réservé Admin Général et Super Admin »). 4 actions (Gestion Bureau Pays, Équipes Nationales, Révisions RH, Rapport de pilotage). Table « Consolidation par Site » (Site Corica, Admin Local RRH, Effectif, Évaluation Terminée %, Alertes Audit, Action « Examiner Site »). Bouton « Générer le Rapport Pays (PDF) ».
- [x] **Step 2 :** Playwright screenshot. Attendu : 4 KPI, campagne en lecture seule avec cadenas, table consolidation par site. ✓ vérifié 2026-08-10 (rendu conforme charte, zéro requête externe). Note : bandeau campagne laissé **neutre** (pas `campaign-card--ok` vert) pour respecter la palette verrouillée ; statut porté par le pill « En cours ».

### Task 3.2 : Rapport de Pilotage Pays
**Files:** Create `maquettes/rh-pays/rapport-pays.html` · Reference `country-admin/page.tsx` (RAPPORT_PILOTAGE_PAYS)
- [x] **Step 1 :** Jauge circulaire SVG « Ratio Global Pays Évalué » (X/Y collaborateurs). Bloc « Effectif & % d'Évaluation par Site » (barres + badges %). Table « Consolidation par Département » (Département, Effectif Total, Évalués, Taux d'Achèvement) — données du code (Opérations Minières 210/200/95 %, Maintenance 150/120/80 %, HQ & Support 180/179/99 %). Jauge réutilise `.gauge` (surchargée en `--ink` : ratio = donnée, pas orange) ; % en texte neutre (pas de badges colorés, palette verrouillée).
- [x] **Step 2 :** Playwright screenshot. ✓ vérifié 2026-08-10 (jauge 87 % = 471/540, barres par site neutres, table départements). Zéro requête externe.

### Task 3.3 : Gestion Bureau Pays
**Files:** Create `maquettes/rh-pays/gestion-bureau.html` · Reference `CountryManagementView.tsx` (mode restreint pays)
- [x] **Step 1 : Sous-vues MENU + MANAGE_SITES**
  MENU : fil d'Ariane, titre « Gestion des Sites — Côte d'Ivoire », 3 KPI (Votre pays, Sites totaux, HQ configurés), boutons Gérer les Sites / Affecter un Administrateur (Créer un Pays masqué en restreint), liste pays/sites (chips HQ/site). MANAGE_SITES : select pays, liste sites (HQ non supprimable), champ « Nom du nouveau site… » + Ajouter. Bascule via `.chipfilter` (onglets app.css).
- [x] **Step 2 : Sous-vue ASSIGN_ADMIN**
  Notice Lock, select Pays + Site, formulaire (Matricule, Nom, Email, Fonction, Département), 5 cartes rôles assignables (Coordinateur Pays, Administrateur Site, Évaluateur N+1, Employé, Responsable Calibration + route), bouton « Affecter l'Administrateur ». Cartes sélectionnables (bordure orange = sélection, conforme charte).
- [x] **Step 3 :** Playwright screenshot des sous-vues (bascule JS). ✓ vérifié 2026-08-10 : 3 sous-vues OK, Créer un Pays absent (mode restreint), 5 rôles, zéro requête externe.

### Task 3.4 : Checkpoint RH Pays + clôture
- [x] **Step 1 :** Revue des écrans RH + réutilisation correcte de 9-box / Mon Profil / Mon Équipe (liens rail vers `../partages/9box.html`, `../employe/profil.html`, `../manager/equipe.html` — tous 200). Fil narratif Blaise OK, campagne en lecture seule, pas de modules Compétences dans le rail RH Pays.
- [x] **Step 2 :** `index.html` mis à jour : la carte « Rôle 3 · RH Pays » (ex-« à venir ») pointe désormais vers `rh-pays/pilotage.html` et liste les 3 écrans ; sous-titre « Les 3 rôles sont livrés ».
- [x] **Step 3 :** Revue globale Playwright ✓ 2026-08-10 : les 8 URL du parcours (index + 3 RH Pays + 9box + equipe + profil + login) répondent 200, zéro requête externe (hors favicon navigateur). **Phase 3 clôturée — les 3 parcours sont livrés.**

---

## Notes d'exécution

- **Pas de framework de test** : la « boucle de test » de chaque tâche = rendu Playwright MCP (`browser_navigate` vers le fichier `file://…`, `browser_take_screenshot`, `browser_network_requests` pour confirmer l'air-gap) + comparaison aux libellés du fichier `src/` de référence.
- **Commits** : regrouper par écran ou par phase. Ne committer que sur demande de l'utilisateur (le repo a des modifs non liées en cours) ; sinon laisser les fichiers en working tree.
- **DRY** : réutiliser `_shell.html` et les patterns `app.css` ; ne créer de CSS que pour un gap réel (Task 0.2).
- **Fidélité** : en cas de doute sur un libellé/colonne/état, relire le fichier `src/` cité — il prime sur toute reformulation.
