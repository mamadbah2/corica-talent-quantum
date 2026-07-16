# CORICA Talent Quantum — comment ça marche (vérifié dans le code)

> Description **fidèle au code réel** (vérifiée fichier par fichier). Objectif : comprendre exactement le problème résolu et le fonctionnement, avant de re-architecturer.
> Pour l'état technique global (prototype), voir `AUDIT-SECURITE-ET-RECO.md`.

---

## 1. C'est quoi Quantum ?

Un outil RH de **gestion de la performance et des talents** pour CORICA Mining Services. Concrètement, il combine **trois processus** qui, aujourd'hui, fonctionnent **en silos peu reliés** :

1. **Évaluation annuelle par objectifs (KPI)** — le cœur du cycle.
2. **Cartographie des talents 9-box** (performance × potentiel) — un **outil séparé**.
3. **Gestion des compétences** (référentiel + plans de développement) — un **silo séparé**.

> Point crucial à retenir : **ces trois briques ne partagent pas leurs données.** La note du cycle par objectifs n'alimente pas le 9-box ; les compétences n'alimentent ni l'un ni l'autre. C'est le principal enjeu de la refonte : **les unifier**.

---

## 2. Le problème métier résolu

Pour des milliers d'employés répartis sur des sites miniers et plusieurs pays, CORICA veut **standardiser l'évaluation annuelle**, **objectiver le potentiel**, **cartographier les talents** (hauts potentiels, piliers, risques) et **planifier le développement** — avec une chaîne de validation N+1 → N+2 et une restitution par site/pays/groupe.

---

## 3. Processus A — Évaluation annuelle par objectifs (le vrai cycle)

C'est le workflow principal, piloté par une **période d'évaluation** ouverte par l'**Admin Groupe**.

```
1. EMPLOYÉ — fixe ses objectifs (nom, description, critère de mesure, délai, POIDS %)
             → soumission bloquée tant que la somme des poids ≠ 100 %
                    │
2. N+1 — valide les objectifs/KPI soumis
                    │
3. EMPLOYÉ — (si période ouverte ET objectifs validés) s'auto-évalue :
             chaque objectif noté 1–4 étoiles + commentaire + livrable
                    │
4. N+1 — évalue chaque objectif (1–4 étoiles) + commentaire + besoins de formation
         → note finale = moyenne des étoiles
                    │
5. N+2 (Comité de calibration) — consulte le dossier, VALIDE et verrouille
        (note d'arbitrage optionnelle)
                    │
6. EMPLOYÉ — voit ses résultats : son auto-évaluation vs la note N+1 (écart),
             badge « Validé N+2 »
```

**Échelle réelle : 1 à 4** (Faible / Passable / Bon / Excellent) — pas de note sur 5.
**Impression** : une fiche « objectifs » et une fiche « évaluation » imprimables (`window.print`).

⚠️ À ce stade : **aucun 9-box, aucun potentiel.** Ce cycle produit une **note de performance par objectifs**, distincte du 9-box.

---

## 4. Processus B — Cartographie 9-box (outil séparé)

Utilisé par les **managers et admins** pour positionner les talents. C'est une **fenêtre dédiée** (`NineBoxModal`), **indépendante** du cycle par objectifs.

- **Performance** : une note **saisie à la main** (échelle 1–4).
- **Potentiel** : un **questionnaire de 16 questions** notées 1–4, regroupées en **Agilité / Aspiration / Motivation & Engagement**. Le potentiel = **moyenne des 16 réponses**.
- **Catégorie calculée automatiquement** (seuils : `> 3,5` = Haut · `≥ 2` = Moyen · `< 2` = Bas) :

| Potentiel ↓ / Perf → | Faible | Moyenne | Haute |
|---|---|---|---|
| **Haut** | Potential Gem | High Potential | **Star** |
| **Moyen** | Inconsistent Player | Core Player | High Performer |
| **Bas** | **Risk** | Average Performer | Solid Performer |

- Les cases sont **cliquables pour filtrer** les collaborateurs. **Pas de glisser-déposer** (le code drag-drop existe mais n'est pas utilisé).
- **L'employé ne voit jamais** son potentiel, sa catégorie ni son placement (réservé aux admins).

---

## 5. Processus C — Compétences (silo séparé)

Accessible à l'**employé** (auto-évaluation) et au **manager** (matrice d'équipe). Indépendant du 9-box.

- **Référentiel** : ~70 compétences, réparties en domaines (Production, Maintenance, HSE, Supply Chain, Leadership…), chacune avec un **niveau requis**. Rattachement **par département** (pas par poste).
- **Échelle : 5 niveaux** (0 = non évalué → 4 = Expert/Formateur).
- **Auto-évaluation employé** (étoiles) et **évaluation manager** de chaque membre.
- **Écarts** (niveau requis − niveau réel) → **plan de développement** : compétence en écart → formation associée (catalogue de ~30 formations) → priorité → **budget** (coût × nombre concernés).

---

## 6. Rôles et hiérarchie

| Rôle (code) | Route | Qui | Fait quoi |
|---|---|---|---|
| `employe` | `/employee` | Collaborateur | Objectifs, auto-évaluation, ses compétences, ses résultats |
| `evaluateur` | `/manager` | **Manager N+1** | Valide les KPI, évalue ses directs, matrice compétences équipe |
| `evaluateur`/`calibration` | `/manager-n2` | **N+2 / Comité calibration** | Consulte, **valide et verrouille** les dossiers |
| `administrator` | `/site-admin` | **RRH de site** | Pilotage du site + évalue ses directs |
| `coordinateur` | `/country-admin` | **DRH pays** | Pilotage pays, rapports |
| `coordinateur` | `/group-admin` | **Admin Groupe** | Pilotage global + **ouvre la période d'évaluation** |
| `superadmin` | `/super-admin` | **Gouvernance (GRC)** | Audit, relances e-mail, override, habilitations |
| (technique) | `/it-admin` | **IT** (même compte que GRC) | Diagnostic, mots de passe, sauvegardes localStorage |

**Chaîne d'évaluation** : chaque personne a un **N+1** (`id_evaluateur`) et un **N+2** (`id_evaluateur_n2`) → c'est l'arbre qui définit qui évalue et qui calibre.
**Périmètre** : site → pays → groupe. La **période d'évaluation** est **unique et globale**, ouverte par l'**Admin Groupe** (et elle verrouille l'auto-évaluation des employés hors fenêtre).

---

## 7. Structure organisationnelle

```
GROUPE (Tous les pays)
 └─ PAYS (Côte d'Ivoire…)
     └─ SITE (Sissengué, Ity, Yamoussoukro, Abidjan…)
         └─ DÉPARTEMENT (Production, Maintenance, RH, Finance, IT, Supply Chain…)
             └─ COLLABORATEUR ──(N+1)──▶ Manager ──(N+2)──▶ Comité
```

---

## 8. État d'implémentation (à savoir pour la refonte)

Le concept fonctionnel est bon, mais l'implémentation actuelle est un **prototype** dont plusieurs mécanismes sont **cosmétiques** — à reconstruire pour de vrai :

| Élément | Réalité actuelle | À faire en cible |
|---|---|---|
| **Persistance** | Tout en **`localStorage`** d'un seul navigateur (flags `kpi_submitted_*`, `n1_eval_submitted_*`, `n2_validated_*`…) | Vraie base partagée (PostgreSQL) |
| **Workflow** | Suite de **booléens localStorage**, pas de machine à états ; forçable via « Override » | Machine à états persistée et auditée |
| **Périmètre (scope)** | **Filtrage `Array.filter` côté client** sur la liste complète ; group/super voient tout | Cloisonnement **serveur** (RBAC réel) |
| **Les 3 processus** | **Silos** : objectifs, 9-box et compétences ne partagent pas leurs données | **Modèle unifié** collaborateur ↔ éval ↔ 9-box ↔ compétences |
| **Notifications** | En mémoire, **n'atteignent pas le destinataire**, perdues au reload | Notifications ciblées persistées |
| **Habilitations** | Table décorative jamais lue pour autoriser | Vrais droits appliqués |
| **E-mails** | Bienvenue/identifiants + notif admin (via Resend), **pas des relances de campagne** | Relances de campagne réelles |
| **9-box calibration** | N+2 = valider/verrouiller ; note d'arbitrage **non sauvegardée** ; pas de drag-drop | Vraie calibration (ajustement + traçabilité) |
| **Données 9-box** | Perf/potentiel **pseudo-générés depuis l'ID** dans l'API ; sauvegarde = `console.log` | Données réelles issues des évaluations |

---

## 9. En une phrase

Quantum veut **évaluer par objectifs → cartographier les talents (9-box) → développer les compétences**, du site au groupe. Aujourd'hui ces trois briques existent mais **séparées et non persistées** ; la valeur de la refonte est de les **unifier sur un socle réel** (base + sécurité + périmètres), la compréhension de ce découpage étant la moitié de la réponse.
