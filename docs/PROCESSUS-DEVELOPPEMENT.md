# Comment va se passer le développement

> Méthode, organisation, phases et rituels pour passer du **prototype** à l'**application de production** CORICA Talent Quantum.

---

## 1. Méthode

**Agile itératif, sprints de 2 semaines.** À chaque sprint : un incrément **fonctionnel, testé et déployé en staging**, démontrable. On ne « big-bang » pas : on sécurise et on construit par couches.

Principes non négociables (cadre DevSecOps) :
- **Sécurité intégrée dès le départ** (pas en fin de projet) : chaque MR passe les scans SAST/SCA/secrets.
- **Tout passe par revue de code** (Merge Request) avant fusion — aucun commit direct sur `main`.
- **Définition of Done** : code + tests + revue + scans verts + doc à jour + déployé en staging.
- **Conformité menée en parallèle** du dev (déclarations aux autorités, registre des traitements) — pas après.

---

## 2. Phases (du plus urgent au plus structurant)

| Phase | Objectif | Livrables clés | Durée indicative |
|---|---|---|---|
| **Phase 0 — Mise en sécurité** | Stopper les risques immédiats | Clé Resend révoquée, tunnels coupés, `npm audit fix`, historique git purgé, `.gitignore` durci | quelques jours |
| **Phase 1 — Socle sécurisé** | Construire les fondations | Auth Entra ID (OIDC), RBAC serveur, PostgreSQL + schéma + migrations, couche API, gestion des secrets | le gros du chantier |
| **Phase 2 — Migration du front** | Brancher l'UI sur le vrai backend | Suppression `ALL_USERS`/`COR-123`/`localStorage`, ressources auto-hébergées, pagination serveur, i18n | en parallèle/après P1 |
| **Phase 3 — Conformité & exploitation** | Production-ready & légal | Journal d'audit RGPD, chiffrement, rétention, registre des traitements, déclarations autorités, monitoring, sauvegardes | continu |
| **Phase 4 — Qualité & évolutions** | Durcir et étendre | Couverture de tests, accessibilité, doc, premières évolutions (OKR, 360°, BI…) | itératif |

> Les phases se **chevauchent** (ex. P2 commence dès que les premières API de P1 existent). Seule la **Phase 0 est strictement préalable**.

---

## 3. Environnements & flux Git

```
  feature/* ──MR──▶ develop ──▶ STAGING (auto)  ──tests E2E──▶  ⛔ approbation ──▶  PROD
     │                                                                                 │
  revue de code obligatoire + CI (lint, tests, SAST, SCA, secret scan)        migrations BDD réversibles
```

- **3 environnements** isolés : `dev` (local/poste), `staging` (préprod intranet), `prod` (intranet).
- **Branches de fonctionnalité** courtes → Merge Request → revue → CI verte → fusion.
- **Migrations de base** versionnées et **réversibles** (Prisma Migrate).
- **Déploiement** automatisé (rolling / blue-green) après approbation manuelle.

(Détail du pipeline : voir `AUDIT-APPROFONDI-ARCHITECTURE.md` §3.)

---

## 4. Rituels de sprint

| Rituel | Quand | But |
|---|---|---|
| **Planification** | Début de sprint | Choisir les items du backlog priorisé |
| **Point quotidien** (15 min) | Chaque jour | Lever les blocages |
| **Revue / démo** | Fin de sprint | Montrer l'incrément aux parties prenantes (DSI/DRH) |
| **Rétrospective** | Fin de sprint | Améliorer le processus |

---

## 5. Rôles & parties prenantes

| Rôle | Responsabilité |
|---|---|
| **Toi (DevSecOps)** | Architecture, sécurité, CI/CD, revue de code, conformité technique |
| **Dev(s) front** | Industrialisation du front (migration, i18n, pagination, intégration API) |
| **Dev(s) back** | API NestJS, modèle de données, intégration Entra ID |
| **DSI CORICA** | Infra intranet, AD/Entra, pare-feu, serveurs, registre d'images |
| **DRH / métier** | Validation des règles métier (workflow d'éval, référentiel compétences) |
| **DPO / juridique** | Déclarations aux autorités, registre des traitements, accord de transfert |

---

## 6. Prérequis bloquants à obtenir de CORICA (avant Phase 1)

1. **Accès Entra ID** (enregistrement d'app, droits) + réponse sur la sortie Internet de l'intranet.
2. **Serveur(s) intranet** pour staging/prod + **PostgreSQL**.
3. **GitLab self-managed** (ou équivalent) + registre d'images interne.
4. **Décision d'hébergement des données** (centralisé vs par pays) + accord de transfert intra-groupe.
5. **Relais email officiel** CORICA (remplacer Resend/test).

---

## 7. Première étape concrète (cette semaine)

La **prochaine réunion** prépare le terrain : présentation des problèmes d'audit + solutions, architecture cible, et **maquettes HTML/CSS** de l'interface visée. Une fois la direction validée → démarrage **Phase 0** puis **Phase 1**.
