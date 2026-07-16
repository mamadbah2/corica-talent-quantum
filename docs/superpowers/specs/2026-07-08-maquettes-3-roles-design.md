# Maquettes 3 rôles — faire ressortir l'utilité de Talent Quantum

**Date :** 2026-07-08
**Statut :** conception validée en brainstorming, en attente de revue du spec
**Support :** maquettes statiques HTML / CSS / vanilla JS (intranet / air-gap)

---

## 1. Objectif

Les maquettes actuelles (9 écrans) verrouillent la **direction artistique** mais montrent des bribes de fonctionnalités piochées dans plusieurs rôles. On veut que les maquettes démontrent que **l'objectif métier de Talent Quantum est rempli** — pas seulement la DA.

Pour cela : prendre **3 rôles qui résument tous les autres** et couvrent toute la chaîne de valeur (Individu → Équipe → Organisation), et maquetter **l'intégralité de leurs vues et de leur userflow**, de sorte que l'utilité se démontre de bout en bout.

Les 3 rôles retenus :

| Rôle | Route codée | Niveau de la chaîne de valeur |
|------|-------------|-------------------------------|
| 👤 **Employé** | `/employee` | Individu — self-service, ses objectifs, son évaluation |
| 👔 **Manager N+1 / Évaluateur** | `/manager` | Équipe — évalue, valide, calibre son équipe |
| 🌍 **RH Pays / Coordinateur** | `/country-admin` | Organisation — pilote la campagne nationale, consolide |

Ces 3 rôles absorbent les autres : le Manager N+2 est une variante du Manager N+1 ; le RH Site (`administrator`) est un sous-ensemble du RH Pays ; l'Admin Groupe/Super Admin est la même vue stratégique à plus large échelle ; l'IT Admin est purement technique.

## 2. Contraintes fermes

1. **Fidélité stricte au code existant.** On ne maquette **que** ce qui est réellement codé pour ces 3 routes. **Ne rien ajouter, ne rien retirer.** On ré-habille l'UI, c'est tout.
2. **Statique.** HTML / CSS / vanilla JS, 100 % local, aucune ressource externe. Non fonctionnel : **données réalistes en dur**, pas de vraie logique.
3. **Design system verrouillé.** On réutilise `maquettes/assets/app.css` (palette neutres chauds + orange-actions, Anton/Archivo, tout carré, rail rétractable). Extensions CSS minimales et cohérentes uniquement si un pattern manque.

## 3. Décisions de conception (issues du brainstorming)

- **Navigation unifiée sous le rail verrouillé.** Le code a un habillage différent par rôle (employé = tuiles + fil d'Ariane + modales plein écran ; manager = double rail imbriqué ; RH = topbar + view-switcher). On **conserve 100 % des vues et du contenu**, mais on les ré-habille tous avec le **rail rétractable** du design system. Chaque modale/vue codée devient un **écran navigable au rail**. Justification : c'est le sens de « readapter l'UI », et ça donne une cohérence entre les 3 rôles fidèle à la DA verrouillée.
- **Séquencement rôle par rôle**, en commençant par l'**Employé** (le plus simple, ~6 écrans), avec **checkpoint de validation après chaque rôle** avant d'attaquer le suivant. Ordre : Employé → Manager → RH Pays.
- **Dispositif de démonstration d'utilité : données réalistes reliées par un fil narratif implicite.** Un même contexte de campagne et des personas cohérents traversent les 3 rôles (voir §4), pour que la continuité de la donnée (soumise par l'employé → validée/notée par le manager → consolidée par le RH) se lise d'un rôle à l'autre. Pas d'annotations « mode démo » ajoutées ; l'utilité ressort des écrans eux-mêmes remplis de données crédibles.

## 4. Personas & données narratives (fil conducteur)

Reprend les utilisateurs de démonstration réels du code (`ALL_USERS` dans `UserContext.tsx`), pour que les 3 rôles racontent la même histoire :

- **Employé — Anzoumana Diakite** (`10057`), fonction EMPLOYE, PRODUCTION, site Sissengué, Côte d'Ivoire. N+1 = 10056, N+2 = 10096.
- **Manager N+1 — Mamadou Traore** (`10056`), PROJECT MANAGER, site Sissengué. Son équipe directe = les 9 collaborateurs `10057→10065` (tous PRODUCTION / EMPLOYE / Sissengué).
- **RH Pays — Blaise Bonzou Essey** (`10053`), COUNTRY HR MANAGER, Côte d'Ivoire, périmètre pays (sites : Sissengué, Ity, Yamoussoukro, Abidjan).

Campagne : **« Campagne 2026 »**. Les objectifs qu'Anzoumana soumet apparaissent chez Mamadou (révision KPIs), l'évaluation de Mamadou remonte dans la 9-box, et l'avancement agrégé se retrouve dans le Pilotage Pays de Blaise.

## 5. Réutilisation du design system

`maquettes/assets/app.css` couvre déjà l'essentiel des patterns nécessaires (vérifié) :

| Besoin | Pattern existant |
|--------|------------------|
| Rail + navigation + repli | `.rail`, `.navitem`, `.rail__toggle`, `.is-collapsed` |
| Grille 9-box 3×3 | `.ninebox`, `.nb-grid`, `.nb-cell`, `.nb-l1..4`, `.nb-xaxis`, `.nb-yaxis`, `.nb-legend`, `.nb-chip` |
| Matrice compétences | `.matrix`, `.matrix-wrap`, `.skillrow`, `.lvl-0..4` |
| Notation par étoiles | `.rating`, `.rating-foot` |
| Tables + statuts + pagination | `.table`, `.cell-person`, `.pill--closed/draft/progress`, `.pagination` |
| Modales / drawers / étapes | `.modal`, `.modal--wide`, `.drawer`, `.stepper`, `.step` |
| KPI / stats | `.stat`, `.statstrip`, `.dfact`, `.dsec` |
| Formulaires | `.field`, `.input`, `.textarea`, `.objrow` |
| Tuiles / notifications | `.role-card`, `.role-grid`, `.notif-panel`, `.notif-item` |
| Tags catégories talents | `.tag--star/core/warn/risk` + tokens `--star/core/grow/warn/risk` |

**Extensions CSS potentielles (à créer seulement si nécessaire, dans l'esprit du système) :** jauge circulaire SVG (ratio pays évalué), carte « campagne active » avec barre de progression + statut, fil d'Ariane léger, bloc « fiche PDF officielle » (formulaire d'évaluation imprimable). Toute extension respecte : tout carré, palette verrouillée, Anton pour titres.

## 6. Organisation des fichiers

```
maquettes/
  assets/app.css            # design system (étendu à la marge si besoin)
  index.html                # hub — mis à jour : entrée par rôle
  employe/                  # Rôle 1 (livré en premier)
    accueil.html
    profil.html
    objectifs.html
    evaluation.html
    dashboard.html
    competences.html
  manager/                  # Rôle 2
    equipe.html
    reviser-kpis.html
    evaluer.html
    resultats.html
    dossier-signatures.html
    rapports.html
    competences-equipe.html
    inbox.html
    profil.html
  rh-pays/                  # Rôle 3
    pilotage.html
    rapport-pays.html
    gestion-bureau.html
  partages/                 # écrans partagés Manager + RH (construits une fois)
    9box.html               # NineBoxModal (3 onglets + personnalisation)
```

Les écrans existants (`dashboard.html`, `evaluation.html`, `competences.html`, `profil.html`, etc.) restent comme **référence du design system** ; on s'en inspire mais on construit les écrans par rôle proprement (certains pourront être adaptés).

## 7. Inventaire des écrans (fidèle au code — source de vérité = les fichiers cités)

> Le détail exhaustif champ-par-champ figure dans les inventaires de recherche et **dans le code lui-même**, qui reste la source de vérité. Chaque écran ci-dessous cite son fichier de référence. Règle : reproduire libellés, colonnes, champs, états **à l'identique**.

### 7.1 — 👤 Employé (réf. `src/app/employee/page.tsx`, `MyProfileMockup.tsx`, `EmployeeSkillsPersonal.tsx`)

| Écran | Réf. code | Contenu clé (fidèle) |
|-------|-----------|----------------------|
| **Accueil** | page.tsx (vue `null`) | Rail (readapté) + 5 entrées : Mon Profil, Mes Objectifs de performance, Mon Auto-évaluation, Dashboard de l'Employé, Mes Compétences & Formation |
| **Mon Profil** | vue `PROFILE` | 4 cartes : Informations Personnelles (photo max 5 Mo, Matricule readonly, Nom, Date de naissance, Email, Téléphone), Informations Professionnelles (Fonction, Date d'embauche, Pays, Site, Département, Service), Manager N+1, Manager N+2 |
| **Mes Objectifs** | vue `OBJECTIVES` | Table : Nom Objectif, Description, Critères de mesure, Délai, Poids %, Actions. Compteur « Total poids » (rouge si ≠ 100 %). Boutons Enregistrer / Imprimer Fiche / Soumettre au Manager (désactivé si ≠ 100 %). Commentaires employé. État vide « Aucun objectif saisi » |
| **Mon Auto-évaluation** | vue `EVALUATION` | Table : Objectifs, Description (KPI), Mesure, Échéance, Évaluation (4 étoiles), Livrables (drop-file), Commentaires. Carte synthèse (note moyenne /4, objectifs évalués). **+ état verrouillé** (cadenas + frise d'étapes) si objectifs non validés N+1 ou période fermée |
| **Dashboard & Data Vault** | vue `DASHBOARD` | BarChart « Évolution des Évaluations », donut « Répartition des Objectifs », module « Résultats de mon Évaluation N+1 » (table + écart), Coffre-Fort (3 cartes verrouillées, dont « Matrice 9-Box — Accès restreint aux Administrateurs »), Plan d'Action (table Action/Objectif lié/Échéance/Statut/Notes) |
| **Mes Compétences & Formation** | `EmployeeSkillsPersonal.tsx` | Score global %, onglet « Mes Compétences » (3 KPI, référentiel par département, auto-éval étoiles, gaps), onglet « Formations & Plan de Développement » (plan par gap, priorités, catalogue formations en K FCFA) |

Note fidélité : la 9-box n'est **jamais** exposée à l'employé (carte verrouillée uniquement).

### 7.2 — 👔 Manager N+1 (réf. `src/app/manager/page.tsx`, `MyTeamMockup.tsx`, `TeamSkillsMatrixView.tsx`, `NineBoxModal.tsx`)

| Écran | Réf. code | Contenu clé (fidèle) |
|-------|-----------|----------------------|
| **Mon Équipe Directe** | MyTeamMockup (TEAM) | Table : Collaborateur, Fonction, Statut Campagne (NOT_STARTED / KPI_SUBMITTED / KPI_APPROVED / N1_EVAL_DONE / COMPLETED), Actions (bouton selon étape + Historique) |
| **Réviser KPIs** (modale→écran) | `ModalReviewKpis` | Cartes objectif éditables (Nom, Description, Critères, Délai, Poids %), Valider chaque objectif, « Poids total », « Valider & Notifier l'Employé » |
| **Évaluer** (modale→écran) | `ModalEvaluer` | 2 tables (Auto-éval employé lecture seule + Votre évaluation N+1, étoiles 1-4), Commentaires Manager, Besoins en Formation (liste), Imprimer, Soumettre |
| **Voir résultats** (modale→écran) | `ModalVoirEval` | Fiche PDF officielle « CORICA MINING SERVICES » : Infos Employé, Infos Manager, Période, Évaluation Manager (table), Commentaires, Demande de Formation, 3 signatures |
| **Dossier / Signatures** (modale→écran) | `ModalSignatures` | Upload PDF signé (phygital), note OCR, « Valider l'Upload et Notifier RH », écran succès |
| **Rapports & Statistiques** | MyTeamMockup (REPORTS) | BarChart « État des Objectifs (KPIs) », « Avancement Global » par collaborateur (barres), « Résumé Global » |
| **Matrice Compétences équipe** | `TeamSkillsMatrixView` | 4 onglets : Matrice Compétences (tableau collaborateurs × compétences, score %), Évaluer un Collaborateur (échelle 1-4), Gaps & Priorités, Formations disponibles |
| **Inbox & Approbations** | MyTeamMockup (INBOX) | Approbations en attente (cartes KPI soumis) + Notifications (typées, Tout marquer lu) |
| **Mon Profil (manager)** | MyTeamMockup (PROFILE) | Champs lecture seule : Département, Grade, Site, Pays, Email, Interface |

Écran partagé appelé ici : **9-Box Talent Matrix** (voir 7.4).
Exclus (non câblés sur `/manager`, thème sombre) : `NineBoxGrid`, `EmployeeTable`, `DashboardCards`, `Sidebar`, `SkillsMatrixModule`.

### 7.3 — 🌍 RH Pays / Coordinateur (réf. `src/app/country-admin/page.tsx`, `CountryManagementView.tsx`, `NineBoxModal.tsx`)

| Écran | Réf. code | Contenu clé (fidèle) |
|-------|-----------|----------------------|
| **Pilotage Pays** (défaut) | page.tsx (COUNTRY_ADMIN) | 4 KPI (Sites Supervisés, Total Talents, Avancement Global ×2), carte « Campagne d'Évaluation Active » **lecture seule** (Programmée/En cours ✓/Clôturée + encart Lock « réservé Admin Général/Super Admin »), 4 actions (Gestion Bureau, Équipes, Révisions RH, Rapport), table « Consolidation par Site » (Site Corica, Admin Local RRH, Effectif, Évaluation Terminée, Alertes Audit, Action) |
| **Rapport de Pilotage Pays** | page.tsx (RAPPORT_PILOTAGE_PAYS) | Jauge SVG « Ratio Global Pays Évalué », effectif & % par site (barres), table « Consolidation par Département » |
| **Gestion Bureau Pays** | `CountryManagementView` (mode restreint pays) | Sous-vues : MENU (3 KPI + liste pays/sites), MANAGE_SITES (ajouter/supprimer site, HQ non supprimable), ASSIGN_ADMIN (formulaire admin + 5 rôles assignables). CREATE_COUNTRY masqué en mode restreint |

Écrans partagés appelés ici : **9-Box Talent Matrix** (7.4), **Mon Profil** (= MyProfileMockup, cf. 7.1), **Mon Équipe** (= MyTeamMockup, cf. 7.2).
Fidélité : le RH Pays est en **lecture seule** sur la campagne (pas d'ouverture/clôture). Pas de modules Compétences ni de création d'employé dans sa propre page (non câblés). `SiteManagementView`, `HabilitationModal`, `GRCReportPreview` sont exclus (autres routes).

### 7.4 — 🔁 Écran partagé : 9-Box Talent Matrix (réf. `NineBoxModal.tsx`, `data.ts`)

Un seul écran, réutilisé par Manager et RH Pays. 3 onglets :
- **Nouvelle Évaluation** : select employé, Note Performance Année N (1-4) + N-1 optionnelle, **16 questions de potentiel** groupées Agilité (7) / Aspiration (4) / Motivation & Engagement (5), boutons Faible/Passable/Bon/Excellent, compteur X/16.
- **Dashboard 9-Box** : filtres (Department, Position, Job Grade, Seniority, Site), grille 3×3 axes PERFORMANCE × POTENTIAL, 9 catégories `MATRIX_CELLS` (STAR, HIGH PERFORMER, SOLID PERFORMER, HIGH POTENTIAL, CORE PLAYER, AVERAGE PERFORMER, POTENTIAL GEM, INCONSISTENT PLAYER, RISK) avec compteur + %, panneau latéral liste employés.
- **Historique** : cartes (employé, catégorie, date, évaluateur).
- Modale « Personnalisation » (couleurs des 9 cases, pondération Y/X) — reproduite en écran.

Les 16 questions de potentiel sont reprises **littéralement** de `POTENTIAL_QUESTIONS` (`data.ts`).

## 8. Userflow (continuité démontrée)

1. **Employé** saisit ses objectifs (poids = 100 %) → « Soumettre au Manager ».
2. **Manager** voit le collaborateur en `KPI_SUBMITTED` → « Réviser KPIs » → « Valider & Notifier ».
3. **Employé** débloque son auto-évaluation (objectifs validés + période ouverte) → note + soumet.
4. **Manager** « Évaluer » (étoiles 1-4) → soumet → place le collaborateur sur la **9-Box** (16 critères).
5. **Manager** clôture le dossier → « Voir résultats » (fiche PDF) → « Dossier/Signatures » (upload phygital).
6. **RH Pays** voit l'avancement agrégé dans **Pilotage Pays**, consolide par site/département, génère le **Rapport Pays**.

Dans les maquettes statiques, cette continuité est illustrée par des **données cohérentes d'un écran à l'autre** (mêmes personas, même campagne, mêmes objectifs).

## 9. Hors périmètre (explicite)

- Les autres rôles (N+2 dédié, RH Site, Admin Groupe, Super Admin, IT Admin) — sauf ce qui transparaît via les 3 rôles.
- Tout composant non câblé sur les 3 routes : `NineBoxGrid`, `EmployeeTable`, `EmployeeDrawer`, `DashboardCards`, `Sidebar`, `SkillsMatrixModule`, `SiteManagementView`, `HabilitationModal`, `GRCReportPreview`.
- Toute vraie logique applicative, backend, auth : les maquettes restent statiques.
- Ajout de fonctionnalités ou d'écrans absents du code.

## 10. Critères de succès

- Les 3 rôles ont **toutes** leurs vues codées reproduites (aucune vue manquante, aucune vue inventée).
- Chaque écran respecte les libellés/colonnes/champs/états du code.
- Tout est ré-habillé au design system verrouillé (rail, palette, Anton/Archivo, tout carré), cohérent entre les 3 rôles.
- La navigation au rail relie les écrans d'un rôle et illustre le userflow.
- Les données sont réalistes et cohérentes d'un rôle à l'autre (fil narratif Anzoumana → Mamadou → Blaise).
- 100 % local, aucune ressource externe.
