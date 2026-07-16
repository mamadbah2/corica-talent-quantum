# Audit approfondi & architecture cible — CORICA Talent Quantum

> **Date :** 2026-06-29 · **Suite de** `AUDIT-SECURITE-ET-RECO.md`
> **Contexte confirmé :** CORICA Mining Services SA — groupe **ivoirien** de services miniers, siège **Abidjan**, présent dans **8 pays d'Afrique de l'Ouest francophone** (Côte d'Ivoire, Mali, Burkina Faso confirmés). Effectif public **2 000–4 000+** (le « ~5 000 » est une estimation interne, non sourcée publiquement). **Déploiement intranet (on-premise).**

---

## 1. Le front répond-il aux attentes d'une appli RH spécialisée CORICA ?

**Verdict : excellente _maquette fonctionnelle_ (~70 % réutilisable comme blueprint), mais bâtie sur des hypothèses de prototype qui cassent à l'échelle production CORICA.**

### ✅ Ce qui répond aux attentes
- **Cœur métier solide** : matrice **9-box** (perf 0-5, potentiel 0-48 via questionnaire), états de workflow d'évaluation (`Pending/Draft/Closed`), historique, calibration N+2.
- **Module compétences étoffé** (8 composants : catalogue, évaluation, matrice, plan de développement, import, vue équipe) — différenciant pour une appli RH spécialisée.
- **Multi-rôle complet** (employé, manager N+1/N+2, admin site/pays/groupe, super-admin) cohérent avec une organisation multi-niveaux.
- **Mode KIOSK** (matricule + PIN) : pertinent pour **terminaux partagés sur sites miniers** (ex. site « Sissengué » présent dans les données).

### ❌ Ce qui ne répond PAS (bloquants à l'échelle CORICA)
| Problème | Impact |
|---|---|
| **Ressources externes en dur** (avatars `pravatar`/`dicebear`, Google Fonts, **Chart.js via CDN jsdelivr**) | 🔴 **Incompatible intranet/air-gap** + fuite de données vers CDN tiers (non-conformité) |
| **Aucune pagination/virtualisation** des listes | 🔴 Rendu de 3 000–5 000 employés → navigateur saturé |
| **Données & identités côté client** (`ALL_USERS`, `localStorage`) | 🔴 Ne tient pas à l'échelle ni en sécurité |
| **Pas d'i18n** (chaînes FR en dur) | 🟠 À valider si filiales anglophones |
| **Zéro test** automatisé | 🟠 Inacceptable en production RH |
| **Incohérence** : `recharts` ET `chart.js` (CDN) coexistent | 🟡 Dette à nettoyer |

**Conclusion :** le front est un **excellent point de départ UX/métier**, à conserver — mais il faut **internaliser toutes les ressources** (polices/icônes/avatars/graphes), **passer les listes en pagination serveur**, **brancher sur un vrai backend**, et ajouter **i18n + tests**.

---

## 2. Stack technologique recommandée

**Contraintes structurantes :** on-premise/intranet, écosystème Microsoft/Entra ID présent, multi-pays, investissement Next.js/React existant, marché de talents tech à Abidjan (JS/TS dominant), connectivité parfois limitée sur sites.

### Frontend → **conserver et industrialiser l'existant**
`Next.js 16` + `React 19` + `TypeScript` + `Tailwind 4` — choix moderne et pertinent, **on garde**. Ajouts :
- **TanStack Query** (état serveur / cache / synchronisation)
- **next-intl** (internationalisation FR/EN)
- **TanStack Table + virtualisation** (listes 5 000+)
- **Ressources auto-hébergées** (fontaines locales, icônes `lucide` déjà en bundle, avatars générés côté serveur)

### Backend → 2 pistes, recommandation par défaut décidée

**🥇 Piste A (recommandée) — TypeScript de bout en bout :**
`NestJS` (Node/TS) + `PostgreSQL` + `Prisma` (ORM) + **Auth.js/OIDC vers Entra ID**.
- **Pourquoi :** préserve l'investissement JS/TS, **un seul langage** front↔back (types partagés), structure entreprise (modules, DI, validation), recrutement facile à Abidjan, déploiement on-prem simple (Docker). Idéal pour un **monolithe modulaire**.

**🥈 Piste B (alternative Microsoft-alignée) — `ASP.NET Core` + `PostgreSQL/SQL Server` + Entra ID.**
- **Pourquoi l'envisager :** si la DSI CORICA est Windows/Microsoft-centrée (l'app tournait déjà via `corica-web-server.exe` sous Windows). .NET offre la **meilleure intégration Entra ID native** et une robustesse entreprise éprouvée.
- **Coût :** réécriture de l'API en C#, perte du partage de types avec le front, compétences .NET requises.

> **Décision par défaut : Piste A (NestJS + PostgreSQL + Prisma + Entra OIDC)**, sauf si la DSI impose un standard .NET — auquel cas Piste B.

### Architecture applicative → **monolithe modulaire** (pas de microservices)
Pour **une** application RH de ~5 000 utilisateurs, les microservices seraient une sur-ingénierie. Architecture en couches + modules métier :
```
[ Next.js (front, intranet) ]
        │ HTTPS (reverse proxy interne Nginx/Traefik)
[ NestJS API ]──┬── Module Employés/Org      ┌─ Auth: Entra ID (OIDC)
                ├── Module Évaluations (9-box)├─ RBAC appliqué SERVEUR
                ├── Module Compétences        ├─ Audit log (RGPD)
                ├── Module Notifications       └─ Validation/erreurs
                └── Module Reporting
        │
[ PostgreSQL ] (+ Redis sessions/cache optionnel)
   ▲ partition « pays » (tenant) sur chaque entité  ← cf. §4 transferts
   ▲ sauvegardes automatiques + PITR
```
**Point d'architecture lié au juridique (§4) :** prévoir dès la conception une **dimension `pays`/tenant** au niveau des données (segmentation par ligne). Cela permet soit une **centralisation couverte par un accord de transfert intra-groupe**, soit une **partition/déploiement par pays** si une autorité l'exige — sans refonte.

---

## 3. Pipeline CI/CD idéal (on-premise / intranet)

**Outil central recommandé : `GitLab self-managed` (CE/EE)** — meilleur ajustement on-prem (Git + CI/CD + registre d'images + scans sécurité intégrés). *Alternative Microsoft : Azure DevOps Server.*

### Étapes du pipeline (avec gates DevSecOps — ton rôle)
```
commit / merge request
  └─ 1. Lint + typecheck
  └─ 2. Tests unitaires
  └─ 3. SÉCURITÉ : SAST (SonarQube self-hosted) · secret scan (gitleaks) · SCA (deps vulnérables)
  └─ 4. Build → image conteneur
  └─ 5. Scan image (Trivy) + signature image
  └─ 6. Push registre interne (GitLab Registry / Harbor)
  └─ 7. Déploiement STAGING (auto)
  └─ 8. Tests intégration + E2E (Playwright)
  └─ 9. ⛔ Approbation manuelle (gate)
  └─ 10. Déploiement PROD (rolling / blue-green) + migrations BDD réversibles + smoke tests
```

### Spécificités intranet/air-gap
- **Miroir de dépendances interne** (Nexus / Verdaccio pour npm) — builds sans Internet.
- **Hébergement runtime** : `Docker Compose` (simple, suffisant pour 5 000 users) ou **`k3s`** (Kubernetes léger on-prem) si haute disponibilité requise.
- **Infra as Code** (Ansible/Terraform) pour reproductibilité.
- **Observabilité self-hosted** : Prometheus + Grafana (métriques), Loki/ELK (logs), alerting.
- **Sauvegardes** PostgreSQL automatisées + tests de restauration ; plan de reprise.
- **Environnements** : dev / staging / prod isolés.

---

## 4. Cadre légal applicable (synthèse sourcée)

> Recherche juridique détaillée et sourcée disponible ; voici l'essentiel opérationnel. **Le droit de la zone évolue vite (réformes 2024-2026) — vérifier auprès de chaque autorité avant déploiement.**

### Instruments supra-nationaux
- **Convention de Malabo (UA, 2014)** : **en vigueur depuis le 8 juin 2023**. Ratifiée notamment par Côte d'Ivoire, Sénégal, Guinée, Niger, Togo. Instrument-cadre (oblige les États, pas directement les entreprises).
- **Acte additionnel CEDEAO A/SA.1/01/10 (2010)** : **contraignant**, matrice des lois ouest-africaines. **Révision en cours** (2024-2026) — à surveiller.
- **UEMOA** : pas d'instrument autonome → lois nationales + CEDEAO. **CEMAC** (Cameroun, Gabon) : **hors CEDEAO**, pas de cadre régional commun de protection des données → **point critique pour les transferts**.

### Lois nationales (autorité de contrôle par pays)
| Pays | Loi | Autorité |
|---|---|---|
| Côte d'Ivoire | Loi 2013-450 | **ARTCI** |
| Sénégal | Loi 2008-12 (*réforme en cours*) | **CDP** |
| Burkina Faso | Loi 001-2021 | **CIL** |
| Mali | Loi 2013-015 (mod. 2017) | **APDP** |
| Guinée | Loi L/2016/037 | APDP *(autorité pas pleinement opérationnelle — à vérifier)* |
| Bénin | Code du numérique 2017-20 | **APDP** |
| Togo | Loi 2019-014 | **IPDCP** |
| Niger | Loi 2022-59 (mod. 2023/2024) | **HAPDP** |
| Cameroun | **Loi 2024/017** | Nouvelle autorité *(obligations entreprises **en vigueur depuis le 23 juin 2026**)* |
| Gabon | Loi 001/2011 (mod. 025/2023) | **APDPVP** |

### Obligations concrètes pour l'application
- **Base légale RH** : ⚠️ **le consentement n'est PAS une base valable** (lien de subordination). Retenir **exécution du contrat de travail + obligation légale + intérêt légitime**.
- **Formalités préalables** : **déclaration** (récépissé) avant mise en service, pays par pays ; **autorisation** si données sensibles (santé/absences, biométrie d'accès, n° d'identification). Une déclaration ne couvre pas tous les pays.
- **DPO/correspondant** : à désigner (recommandé vu le volume + multi-pays).
- **Droits des personnes** : accès, rectification, opposition, effacement (lois récentes) → prévoir un **canal d'exercice** dans l'app, et l'**accès du salarié à sa propre évaluation**.
- 🔴 **Transferts transfrontaliers = risque n°1.** Une **BDD centralisée** héberge les données de 8 pays sur un seul serveur → juridiquement un **transfert transfrontalier** depuis chaque pays. Aucun pays africain n'a de décision d'adéquation. Exige : **formalités locales + clauses contractuelles intra-groupe** (data transfer agreement) couvrant **CEDEAO ET CEMAC**.
- **Conservation** : politique de rétention documentée par catégorie (durée d'emploi + archivage justifié).
- **Sécurité + notification de violation** : obligation générale ; notification explicite dans les textes récents (Cameroun, Niger, Gabon, Bénin).
- **Sanctions** : lourdes — ex. **Cameroun 50 M–1 Md FCFA**, Togo < 100 M FCFA + retrait d'autorisation.

### Droit du travail (évaluation de performance)
- **Pas d'harmonisation OHADA** (l'Acte uniforme travail n'a jamais été adopté) → **Code du travail de chaque pays** (modèle français).
- Principes communs : **information préalable** du salarié sur le dispositif, **critères objectifs/transparents/pertinents**, éventuelle **consultation des représentants du personnel** (à confirmer par Code national).

### RGPD européen
- **En principe non applicable** (salariés africains, entités africaines). **Peut s'appliquer** si un **établissement du groupe dans l'UE** pilote le traitement, ou pour des salariés situés dans l'UE.
- ✅ **Pertinent comme standard de référence** : construire sur un **socle RGPD-compatible** couvre/dépasse les 10 juridictions — **puis ajouter les formalités locales**.

### 🎯 Stratégie de conformité recommandée
1. **Socle commun RGPD-compatible** : base légale documentée, **registre des traitements**, **DPIA**, durées de conservation, droits des personnes intégrés, sécurité + procédure de violation.
2. **Déclinaison locale** : déclaration/autorisation auprès de chaque autorité (ARTCI, CDP, CIL, APDP-Mali, APDP-Bénin, IPDCP, HAPDP, autorité camerounaise, APDPVP ; cas guinéen à clarifier).
3. **Sécuriser la centralisation** par un **accord de transfert intra-groupe** couvrant CEDEAO + CEMAC, et concevoir l'architecture avec la **dimension pays** (cf. §2).

---

## 5. Possibilités d'évolution

**Intégrations**
- **Synchronisation Entra ID / AD** (organigramme, arrivées/départs automatiques).
- **SIRH / paie** (import effectifs, matricules, contrats).
- **Notifications Teams / Outlook** (relances d'évaluation).
- **BI self-hosted** (Metabase / Power BI on-prem) pour pilotage RH.

**Fonctionnel**
- Objectifs/**OKR**, **feedback 360°**, **plans de succession**, gestion de la **formation**, **mobilité interne**, **recrutement**.
- **Mode hors-ligne** + synchro pour sites isolés ; **app mobile / kiosque durci** pour le terrain.
- **Multi-langue** (EN) pour montée en charge régionale.

**Technique & conformité**
- **Entrepôt de données RH** + tableaux de bord conformité (registre, DPIA, exercice des droits).
- **API interne** pour interconnexions ; **journal d'audit** exploitable.
- **IA** (via API Claude, en interne) : matching compétences ↔ postes, recommandations de succession, détection de risques de départ, aide à la rédaction d'évaluations — en gardant l'humain décideur et le contrôle des données.

---

## Synthèse décisionnelle

| Question | Réponse |
|---|---|
| Le front convient-il ? | Oui comme **blueprint UX/métier (~70 %)**, non en l'état (intranet, échelle, sécurité) |
| Stack ? | **Front : garder Next.js/React/TS.** Back : **NestJS + PostgreSQL + Prisma + Entra OIDC** (déf.) ou ASP.NET Core (si DSI Microsoft) |
| Architecture ? | **Monolithe modulaire** conteneurisé on-prem, avec dimension **pays/tenant** |
| CI/CD ? | **GitLab self-managed** + gates DevSecOps (SAST/SCA/secret/image scan), miroir deps interne, Docker/k3s |
| Lois ? | Socle **RGPD-compatible** + **formalités locales par pays** ; **transferts transfrontaliers = priorité** |
| Évolutions ? | Entra/SIRH, OKR/360/succession, hors-ligne terrain, BI, IA RH |
