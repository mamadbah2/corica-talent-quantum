# Planche d'inspiration ciblée — CORICA Talent Quantum

> **Principe directeur : UX & features = les meilleurs du monde · UI = 100 % CORICA.**
> On vole les *patterns d'interaction* et le *découpage fonctionnel* aux leaders HR Tech (Lattice, ChartHop, SuccessFactors…), mais tout ce qui est **couleur, typo, motif, ton** suit l'identité brun/orange (voir [`IDENTITE-VISUELLE-CORICA.md`](./IDENTITE-VISUELLE-CORICA.md) + tokens dans [`DESIGN.md`](./DESIGN.md)).
>
> **Piège à éviter :** ne pas s'inspirer de landing pages primées (Awwwards/Godly). Ce produit vit dans des **tableaux, matrices et workflows de validation**. La beauté ici = densité maîtrisée + hiérarchie + cohérence, pas des effets.

---

## 0. Le langage UI CORICA (rappel — s'applique à TOUS les écrans)

Ne pas redéfinir par écran. Source de vérité = `DESIGN.md`. En résumé opérationnel :

| Élément | Traitement CORICA |
|---|---|
| Rail de navigation | Brun profond `#463838` (`--rail`), icône + libellé, **état actif orange** `#F26322` |
| Fond appli / cartes | Neutres chauds (`--bg`, `--surface`) — jamais gris-bleu froid |
| Accent / actions / sélection | Orange `#F26322` — **≤ 10 %** de la surface dans les zones de travail |
| Texte | Brun `#463838` (`--ink`), pas de noir pur |
| Titres | Condensé capitales (Oswald/Anton libre), **bicolore blanc/brun + orange** sur les héros |
| Statuts / 9-box | Couleurs sémantiques **désaturées** (`--star` vert muet, `--core` bleu muet, `--risk`, `--warn`) — fonctionnelles, **hors marque** |
| Séparateurs / héros | Bande **motif hachures orange** (`brand-assets/corica-pattern-strip.png` en `mask`, recolorable) |
| Logo | `corica-logo-dark.svg` (fond clair) / `corica-logo-white.svg` (fond brun) ; mark seul = app-icon |
| Élévation / rayons | Ombres douces basses, rayons 10-12px panneaux / 8px contrôles / 999px pills |
| Kiosque | Cibles ≥ 44px, typo agrandie, pavé PIN large |

**Comment lire les liens « À voir » :** sur **Mobbin** cherche le produit nommé (vrais écrans navigables) ; sur **Dribbble** les URL `dribbble.com/search/<terme>` sont directes ; **Tremor / Tailwind UI (Application UI) / Untitled UI** = composants prêts à réutiliser.

---

## 1. Portail d'accueil — sélection de rôle
**Route réelle : `/` · aujourd'hui : 8 cartes rôle, pas de maquette**

- **UX à voler :** l'écran de **sélection d'espace / workspace switcher**. Regarde **Linear** (choix de workspace), **Notion** (switcher) et surtout les **app launchers** type Microsoft 365 / Okta dashboard — grille de cartes avec icône, titre, sous-titre, tag.
- **Feature de référence :** regrouper par **domaine** (Collaborateur / Management / Admin RH / Gouvernance) avec un **compteur de contexte** (rôles, pays, sites) — déjà présent dans le code, à garder.
- **UI CORICA :** héros brun `#463838` en haut avec titre bicolore condensé (« BIENVENUE » blanc + « TALENT QUANTUM » orange) + **bande motif** en séparateur. Cartes blanches, icône dans pastille orange soft, hover → bordure orange. Retirer le badge « Mode Bac à Sable » criard une fois en prod.
- **À voir :** Mobbin → *Okta*, *Microsoft 365 launcher* · Dribbble → [`role-selection`](https://dribbble.com/search/role-selection), [`app-launcher`](https://dribbble.com/search/app-launcher) · Tailwind UI → *Application Shells / Grid lists*.

---

## 2. Connexion — SSO Office 365 + kiosque PIN
**Route réelle : `/login` · maquette : `login.html` ✅**

- **UX à voler :** le **split-screen auth** (visuel plein cadre à gauche, formulaire à droite) façon **Linear / Vercel / Retool login**. Pour le **pavé PIN kiosque**, inspire-toi des UI **POS / banque mobile** (Revolut, Square) : gros chiffres, feedback tactile, ≥ 44px.
- **Feature de référence :** **double parcours** clair — bouton primaire « Se connecter avec Microsoft 365 » (Entra ID) + bascule « Mode kiosque / PIN » pour les sites miniers sans compte perso. Voir `SSO-OFFICE365-INTRANET.md`.
- **UI CORICA :** panneau gauche = **photo duotone brun/orange** (portrait humain / faune, ton « on rentre tous chez nous ce soir » = HSE) + logo blanc + slogan bicolore. Panneau droit blanc, bouton M365 en brun, PIN pad en orange sur pression.
- **À voir :** Mobbin → *Vercel*, *Linear* (auth) · Dribbble → [`login split screen`](https://dribbble.com/search/login-split-screen), [`pin pad`](https://dribbble.com/search/pin-pad) · Refero → écrans « Sign in ».

---

## 3. Tableau de bord & Matrice 9-Box
**Routes réelles : `/manager`, `/site-admin` · maquette : `dashboard.html` ✅ (à recadrer par rôle)**

- **UX à voler :** LA référence 9-box mondiale = **SAP SuccessFactors (Talent/Calibration)** et **ChartHop (talent grid)** — grille 3×3, cellules cliquables filtrantes, pastilles employés, légende. **Lattice** pour la clarté des KPIs en tête de dashboard.
- **Feature de référence :**
  - **Bandeau KPIs** haut (Collaborateurs / % clôturé / En cours / À risque / Hauts potentiels) — pattern *stat cards* de Lattice/Linear Insights.
  - **9-box** : filtrage par clic sur cellule (déjà là), + à terme **drag-drop de calibration** (SuccessFactors) — le code drag existe mais dormant.
  - **Liste « évaluations récentes »** avec avatar + catégorie + statut (pattern *activity table*).
- **UI CORICA :** cellules 9-box en **sémantique désaturée** (`--star`/`--core`/`--risk`/`--warn`) pour ne pas voler la vedette à l'orange ; l'orange reste sur les **actions** (« + Placer », « Tout voir ») et l'état actif. Chiffres en `tabular-nums`.
- **À voir :** Mobbin → *ChartHop*, *Lattice* · Dribbble → [`9-box grid`](https://dribbble.com/search/9-box-grid), [`talent matrix`](https://dribbble.com/search/talent-matrix), [`hr dashboard`](https://dribbble.com/search/hr-dashboard) · **Tremor** (tremor.so) pour construire les stat cards + grille.

---

## 4. Espace Employé — profil, objectifs/KPI, auto-évaluation, résultats
**Route réelle : `/employee` (1402 l., le plus gros écran) · AUCUNE maquette ❌**

- **UX à voler :** **Lattice** et **Leapsome** « Goals » = référence absolue pour la **co-construction d'objectifs pondérés**. Pour l'**auto-évaluation par étapes**, inspire-toi des **wizards multi-step** (Typeform-like, mais dense) + le pattern **« mes objectifs / mon évaluation / mes résultats »** en onglets.
- **Feature de référence :**
  - **Éditeur d'objectifs** avec **jauge de poids qui doit atteindre 100 %** (bloque la soumission sinon) — pattern *budget allocation* (voir aussi allocation ChartHop). Rendre la jauge très visible.
  - **Notation 1–4 étoiles** par objectif + commentaire + livrable.
  - **Écran de résultats** : comparaison **auto-éval vs note N+1** (barres en regard / diff), badge « Validé N+2 ». Pattern *comparison view* de 15Five/Culture Amp (self vs manager).
  - **Compétences perso** (voir écran 6).
- **UI CORICA :** onglets sobres soulignés orange à l'actif ; étoiles remplies en orange ; jauge de poids = anneau/barre orange (100 % = vert muet `--ok`). Ton humain/valorisant (pas « surveillance »).
- **À voir :** Mobbin → *Lattice*, *15Five* · Dribbble → [`goal setting`](https://dribbble.com/search/goal-setting), [`performance review`](https://dribbble.com/search/performance-review), [`multi step form`](https://dribbble.com/search/multi-step-form) · Tailwind UI → *Forms / Steps*.

---

## 5. Workflow d'évaluation N+1 + Inbox / Approbations
**Route réelle : `/manager` (onglets Mon Équipe / Inbox / Mon Profil) · maquette : `evaluation.html` ✅ (partiel)**

- **UX à voler :** le **combo « Inbox + panneau latéral »** de **Linear** / **Front** / **Missive** = idéal pour « dossiers à valider ». Liste à gauche, dossier ouvert à droite (drawer) sans changer de page. **Betterworks / PerformYard** pour le workflow review manager.
- **Feature de référence :**
  - **Inbox d'approbations** : objectifs à valider, auto-évals reçues, avec états (à traiter / en retard) — pattern *triage inbox*.
  - **Formulaire d'évaluation** critère par critère (dont **HSE**), notation 1–4, commentaire, **besoins de formation** (qui alimentent le plan de dev).
  - **Drawer collaborateur** contextuel (déjà `EmployeeDrawer.tsx`) — profil + historique + éval en cours.
- **UI CORICA :** liste dense en-têtes collants ; drawer droit sur fond `--surface` ; bouton « Valider » orange, « Renvoyer » ghost brun ; mention légale en pied discrète. Étapes de workflow = timeline horizontale brun/orange.
- **À voir :** Mobbin → *Linear* (inbox), *Front* · Dribbble → [`approval workflow`](https://dribbble.com/search/approval-workflow), [`inbox ui`](https://dribbble.com/search/inbox-ui), [`side drawer`](https://dribbble.com/search/side-drawer) · Tailwind UI → *Slide-overs*.

---

## 6. Matrice de compétences + Plan de développement
**Composant réel : module `skills/` (8 sous-vues) · maquette : `competences.html` ✅**

- **UX à voler :** la **skills matrix** moderne = **Gloat**, **Eightfold AI**, **TechWolf** (niveaux par personne × compétence, code couleur de maîtrise). Pour les **écarts → plan de dev → budget**, inspire-toi des vues *gap analysis* de **Cornerstone** / **Degreed**.
- **Feature de référence :**
  - **Matrice** collaborateur × compétence, cellules colorées par **niveau 0–4** (Débutant→Expert), filtres par domaine (Techniques / HSE / Management).
  - **Panneaux d'analyse** : « mieux couvertes » (barres %) + « écarts critiques — action requise ».
  - **Plan de développement** : écart → formation (catalogue ~30) → priorité → **budget calculé** (coût × concernés). Pattern *planning table* avec total.
- **UI CORICA :** ⚠️ **piège majeur** — l'échelle de niveaux N'EST PAS la marque : utiliser un **dégradé désaturé neutre→sémantique** (débutant rouge muet → expert vert muet), **jamais l'orange pour un niveau** (l'orange reste l'action « + Plan de développement »). Header d'écran avec CTA orange.
- **À voir :** Mobbin → *(chercher « skills »)* · Dribbble → [`skills matrix`](https://dribbble.com/search/skills-matrix), [`competency`](https://dribbble.com/search/competency), [`heatmap table`](https://dribbble.com/search/heatmap-table) · Tremor → *heatmap / BarList*.

---

## 7. Comité de calibration N+2
**Route réelle : `/manager-n2` · AUCUNE maquette ❌**

- **UX à voler :** les **calibration sessions** de **SuccessFactors** et **Workday** (talent review) — vue de comité où l'on **compare, ajuste et verrouille** un lot de dossiers ensemble. Pattern *review queue + lock*.
- **Feature de référence :** liste des évaluations N+1 soumises → consultation dossier → **valider & verrouiller** (note d'arbitrage optionnelle) → badge « Validé N+2 ». À terme : ajustement 9-box collectif avec traçabilité.
- **UI CORICA :** table de files (En attente / Validés N+2), état verrouillé = cadenas brun ; action « Verrouiller » orange, irréversible → confirmation. Traçabilité en ton institutionnel.
- **À voir :** Mobbin → *Workday* · Dribbble → [`review queue`](https://dribbble.com/search/review-queue), [`calibration`](https://dribbble.com/search/calibration) · Tailwind UI → *Tables + Dialogs (confirm)*.

---

## 8. Dashboards consolidés — Site / Pays / Groupe
**Routes réelles : `/site-admin`, `/country-admin`, `/group-admin` · AUCUNE maquette ❌**

- **UX à voler :** le **drill-down multi-niveaux** (Groupe → Pays → Site → Département) façon **Workday People Analytics**, **Visier**, ou tout bon **BI dashboard** (Metabase/Looker). Cartes de progression de campagne + tableaux de sites.
- **Feature de référence :** avancement de campagne par périmètre, taux de complétion, filtres de scope, export/rapport. L'Admin Groupe **ouvre la période d'évaluation** (action forte, unique).
- **UI CORICA :** même shell brun/orange ; **jauges d'avancement** orange sur piste neutre ; badges d'état campagne (Non configurée / En cours / Clôturée) désaturés. Cohérence stricte entre les 3 niveaux (même grille, données différentes).
- **À voir :** Mobbin → *(BI/analytics apps)* · Dribbble → [`analytics dashboard`](https://dribbble.com/search/analytics-dashboard), [`admin dashboard`](https://dribbble.com/search/admin-dashboard) · Tremor → *dashboards complets* (la meilleure base ici).

---

## 9. Gouvernance GRC + IT-Admin
**Routes réelles : `/super-admin`, `/it-admin` (1368 l., ~40 sous-sections) · AUCUNE maquette ❌**

- **UX à voler :** les **consoles admin/sécurité** — **Vercel dashboard**, **Datadog**, **Stripe** (audit logs, statut système, feature checks). Pour les **habilitations/RBAC**, regarde **Okta Admin** / **AWS IAM** (matrices de droits).
- **Feature de référence :** journaux d'audit filtrables, statut d'intégrité (checks santé), gestion utilisateurs, habilitations réelles, relances e-mail de campagne, override tracé.
- **UI CORICA :** ton plus « technique/sobre », toujours brun/orange mais orange minimal (danger réel = `--risk` rouge-orangé). Tables de logs mono-espacées, badges statut, pas de fioriture. Note : `/it-admin` est absent du menu racine — à réintégrer ou masquer volontairement.
- **À voir :** Mobbin → *Vercel*, *Stripe* · Dribbble → [`audit log`](https://dribbble.com/search/audit-log), [`admin console`](https://dribbble.com/search/admin-console), [`permissions table`](https://dribbble.com/search/permissions-table) · Tailwind UI → *Tables / Stacked lists*.

---

## Priorités de re-skin (ma reco)

1. **Écran 2 (Login)** + **Écran 3 (Dashboard 9-box)** + **Écran 6 (Compétences)** — les 3 maquettes v1 existantes → re-skin identité en premier, ROI immédiat.
2. **Écran 1 (Portail)** — vitrine, vu en premier par tout le monde, aujourd'hui non maquetté.
3. **Écran 4 (Employé)** — le plus gros trou fonctionnel, le plus utilisé.
4. **Écrans 5 / 7 / 8 / 9** — au fil de la couverture rôle.

**Sources n°1 à garder ouvertes en permanence :** **Mobbin** (Lattice, ChartHop, Workday, Linear, Vercel) pour l'UX réelle · **Tremor** (tremor.so) pour bâtir vite les dashboards/matrices · **Tailwind UI (Application UI)** pour tables/forms/drawers. Le reste (Dribbble) = direction artistique ponctuelle.
