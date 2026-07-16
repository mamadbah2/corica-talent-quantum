# Audit de sécurité & recommandation — CORICA Talent Quantum (9-Box)

> **Date :** 2026-06-29 · **Périmètre :** code récupéré (archive `OneDrive_2026-06-25.zip`)
> **Mandat :** auditer l'existant et recommander la suite (décision « reprendre de zéro » vs « recustom »).
> **Contexte cible :** production réelle CORICA · vraies données RH (RGPD) · SSO Microsoft Entra ID disponible.

---

## 1. Résumé exécutif

L'application livrée est un **prototype front-end cliquable de haute fidélité**, et **non une application prête pour la production**. L'interface, les parcours par rôle et la modélisation métier (9-box, référentiel de compétences, workflow d'évaluation) sont aboutis et **réutilisables**. En revanche, **aucune fondation sécurisée n'existe** : pas de base de données, pas d'authentification réelle, aucun contrôle d'accès côté serveur, secrets et « mots de passe » gérés dans le navigateur.

**Verdict :** ❌ **Non déployable en production en l'état.** Pour de vraies données RH, ce serait un risque de confidentialité majeur.

**Recommandation :** ni *full-rewrite*, ni *recustom à l'identique*. **Conserver le front-end comme spécification vivante + maquette, et construire le socle sécurisé en dessous** (auth Entra ID, BDD, autorisation serveur, API, secrets, déploiement maîtrisé).

---

## 2. Nature réelle du projet (constat)

| Couche | Annoncé (`.env.example`) | Réalité (code) | État |
|---|---|---|---|
| Base de données | PostgreSQL + `DATABASE_URL` | Aucun driver/ORM ; données **mockées en mémoire** (`MOCK_HISTORY`), perdues au redémarrage | ❌ absent |
| Authentification | SSO **Azure Entra ID** + NextAuth | Factice, **100 % côté navigateur**, mot de passe `COR-123` en dur pour tous | ❌ factice |
| Autorisation (RBAC) | implicite | `useRoleGuard` **auto-connecte un utilisateur démo** au lieu de bloquer → `/super-admin` accessible directement | ❌ inexistant |
| Persistance | serveur | `localStorage` du navigateur (utilisateurs, overrides de mots de passe, photos) | ⚠️ non fiable |
| Email | SMTP Exchange interne | dépendance `nodemailer` mais `.env.local` = **clé API Resend** | ⚠️ incohérent |

> **Lecture :** le `.env.example` décrit une architecture cible *souhaitée*, pas l'architecture *réalisée*. L'écart entre les deux est l'essentiel du travail restant.

**Taille du socle réutilisable :** ~19 000 lignes TS/TSX, 39 composants/pages, stack moderne (Next.js 16, React 19, Tailwind 4, dnd-kit, recharts, react-table).

---

## 3. Registre des risques

| # | Risque | Sévérité | Détail |
|---|---|---|---|
| R1 | **Aucun contrôle d'accès** | 🔴 Critique | N'importe qui atteint n'importe quel rôle (super-admin inclus). Inacceptable pour des données RH. |
| R2 | **Authentification factice** | 🔴 Critique | Mot de passe `COR-123` en dur, vérification côté client, contournable trivialement. |
| R3 | **Secret exposé** | 🔴 Critique | Une **clé API Resend réelle** était présente dans `.env.local` (dans l'archive). À **révoquer/roter immédiatement**. |
| R4 | **Pas de persistance fiable** | 🟠 Élevé | Données en mémoire / `localStorage` → perte, incohérence, aucune intégrité ni sauvegarde. |
| R5 | **Exposition shadow-IT** | 🟠 Élevé | `ngrok.exe` / `cloudflared.exe` / `corica-web-server.exe` → app exposée sur Internet via tunnels depuis un poste Windows, hors gouvernance IT. À cesser. |
| R6 | **Dépendances vulnérables** | 🟠 Élevé | 9 vulnérabilités npm (5 *high*), dont **`next`** lui-même. Corrigeables (`npm audit fix`). |
| R7 | **Historique git pollué** | 🟡 Moyen | Binaires (~178 Mo) et logs de tunnel (`cf-tunnel.log`, 11 478 lignes) **toujours dans l'historique** malgré leur retrait du *working tree*. À purger (BFG/`git filter-repo`). |
| R8 | **Conformité RGPD absente** | 🟠 Élevé | Aucune journalisation d'accès, chiffrement, gestion de rétention/consentement — requis pour des données RH personnelles multi-pays. |

> ✅ **Point positif :** les fichiers `.env*` n'ont **jamais été commités** dans git → pas de fuite des identifiants BDD/Azure via l'historique. La seule fuite avérée est la clé Resend présente dans l'archive (R3).

---

## 4. Ce qui a de la valeur (à conserver)

- L'**UX et les écrans par rôle** (employé, manager N+1/N+2, admin site/pays/groupe, super-admin) — vrai travail de conception.
- La **modélisation métier** : matrice 9-box, référentiel de compétences (`skillsData.ts`, ~40 Ko), workflow d'évaluation, calibration.
- Les utilitaires **impression/PDF** et **email** (logique réutilisable une fois branchée sur un vrai backend).
- La **stack technique**, moderne et pertinente pour la cible.

---

## 5. Recommandation : « zéro » vs « recustom »

**→ Approche hybride : garder le front, (re)construire le socle.**

- **Ne pas jeter** le front-end : ce serait gaspiller ~19 000 lignes de travail UX/métier valide.
- **Ne pas « recustomiser » l'existant tel quel** : il n'y a pas de socle sécurisé à customiser ; tout ce qui touche à la confiance (auth, autorisation, données) est aujourd'hui **dans le navigateur** et doit être **déplacé côté serveur**.
- Conséquence honnête : le front sera **conservé comme UI/maquette de référence**, mais son **flux de données sera retravaillé en profondeur** pour consommer un vrai backend sécurisé (suppression de `ALL_USERS`, `COR-123`, `localStorage`, `useRoleGuard` auto-login).

---

## 6. Feuille de route proposée (par phases)

**Phase 0 — Mise en sécurité immédiate (jours)**
- Révoquer/roter la clé API Resend (R3).
- Cesser toute exposition par tunnel (R5) ; cadrer un hébergement gouverné.
- `npm audit fix` (R6) ; ajouter/renforcer `.gitignore`.
- Purger l'historique git (binaires + logs) avec `git filter-repo` (R7).

**Phase 1 — Socle sécurisé (le cœur du chantier)**
- **Auth Entra ID** (OIDC) via Auth.js/NextAuth, sessions serveur, cookies sécurisés.
- **Autorisation RBAC appliquée côté serveur** sur chaque route API (fin de `useRoleGuard`).
- **PostgreSQL** + schéma + migrations + ORM (Prisma/Drizzle) ; remplacement des mocks.
- **Couche API sécurisée** (validation entrée, gestion d'erreurs, rate-limiting).
- **Gestion des secrets** (variables d'env gouvernées / Azure Key Vault).

**Phase 2 — Migration du front**
- Brancher les écrans sur les vraies API ; retirer données/identités en dur et `localStorage`.

**Phase 3 — Conformité & exploitation**
- Journalisation d'audit RGPD, chiffrement en transit/au repos, rétention/consentement.
- Durcissement (en-têtes sécurité, CSP), CI/CD, tests, monitoring, sauvegardes.

---

## 7. Estimation (ordre de grandeur, à affiner)

- **Front réutilisable :** ~70 % en tant qu'UI (refonte du flux de données nécessaire).
- **Socle à construire :** chantier de plusieurs semaines à quelques mois selon l'effectif — l'essentiel de l'effort est en Phase 1.
- **Prérequis bloquants à confirmer côté CORICA :** tenant Entra ID & droits d'app, serveur PostgreSQL, décision d'hébergement, relais email officiel.

---

## 8. Actions immédiates recommandées (cette semaine)

1. 🔴 **Révoquer la clé API Resend** trouvée dans `.env.local`.
2. 🔴 **Geler les tunnels** (ngrok/cloudflared) et toute exposition du prototype contenant des données réelles.
3. 🟠 `npm audit fix` + revue des 5 vulnérabilités *high*.
4. 🟡 **Purger l'historique git** (binaires + logs de tunnel) et durcir `.gitignore`.
5. 🟢 **Valider les prérequis infra** (Entra ID, PostgreSQL, hébergement) avant de démarrer la Phase 1.
