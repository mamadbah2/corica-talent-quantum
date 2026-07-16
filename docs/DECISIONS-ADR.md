# Journal des décisions d'architecture (ADR)

> Chaque décision prise pour le projet CORICA Talent Quantum, avec son **pourquoi** et les **alternatives écartées**. Document vivant — à mettre à jour à chaque nouvelle décision.
> Statut : 🟢 actée · 🟡 recommandée (à confirmer DSI) · ⚪ à décider

| # | Décision | Statut | Pourquoi | Alternatives écartées |
|---|---|---|---|---|
| D1 | **Conserver le front-end** Next.js/React existant comme base | 🟢 | ~19 000 lignes de valeur UX/métier réelle (9-box, compétences, multi-rôle) ; le jeter serait du gaspillage | Réécrire from scratch (perte de valeur) |
| D2 | **Stack front : Next.js 16 + React 19 + TypeScript + Tailwind** | 🟢 | Moderne, déjà en place, talents disponibles à Abidjan | Angular/Vue (réécriture inutile) |
| D3 | **Backend : NestJS + PostgreSQL + Prisma** | 🟡 | TypeScript de bout en bout (types partagés front/back), structure entreprise, recrutement JS facile, déploiement on-prem simple | ASP.NET Core (si DSI Microsoft — gardé en alternative D3-bis) ; Next full-stack (insuffisant pour un domaine RH complexe) |
| D3-bis | **Alternative backend : ASP.NET Core** | ⚪ | À retenir **si** la DSI impose un standard Microsoft/.NET (meilleure intégration Entra native) | — |
| D4 | **Authentification : Office 365 / Entra ID (OIDC)** | 🟡 | O365 déjà présent ; supprime tout mot de passe géré par l'app (fin du `COR-123`) ; MFA et gouvernance par l'IT | Auth maison (risqué, à maintenir) ; voir `SSO-OFFICE365-INTRANET.md` |
| D5 | **RBAC appliqué côté serveur** (mapping via groupes Entra) | 🟢 | Sécurité : le contrôle d'accès actuel est côté client donc contournable (`useRoleGuard` auto-login) | Contrôle côté client (vulnérabilité critique) |
| D6 | **Architecture : monolithe modulaire** (modules métier) | 🟢 | Adapté à **une** appli de ~5 000 users ; simple à déployer/opérer on-prem | Microsoft-services (sur-ingénierie, complexité opérationnelle injustifiée) |
| D7 | **Dimension `pays`/tenant dans le modèle de données** | 🟢 | Permet centralisation **ou** partition par pays selon exigences des autorités — sans refonte (cf. transferts transfrontaliers) | Modèle mono-pays (bloquerait la conformité) |
| D8 | **CI/CD : GitLab self-managed** + gates DevSecOps | 🟡 | Contrainte intranet : Git + CI/CD + registre + scans sécurité, tout on-prem | GitHub/GitLab cloud (incompatible intranet) ; Azure DevOps Server (alt. si Microsoft) |
| D9 | **Déploiement : conteneurs Docker (ou k3s) on-premise** | 🟢 | Contrainte intranet ; reproductibilité ; k3s seulement si haute dispo requise | Cloud public (exclu par la contrainte intranet) |
| D10 | **Ressources auto-hébergées** (polices, icônes, avatars, graphes) | 🟢 | L'intranet est (semi) air-gap → les CDN externes ne chargent pas ET fuitent des données (RGPD) | CDN externes (pravatar/dicebear/Google Fonts/jsdelivr — à supprimer) |
| D11 | **Conformité : socle RGPD-compatible + formalités locales par pays** | 🟢 | Le RGPD est le plus haut dénominateur commun ; couvre/dépasse les 10 juridictions, puis déclaration par autorité nationale | Conformité pays-par-pays sans socle commun (ingérable) |
| D12 | **Base légale du traitement RH = contrat + obligation légale + intérêt légitime** | 🟢 | Le **consentement n'est PAS valable** entre employeur et salarié (lien de subordination) | Consentement (juridiquement fragile) |
| D13 | **BDD : PostgreSQL** | 🟢 | Open-source, robuste, relationnel adapté aux données RH, on-prem friendly, sauvegardes/PITR | SQL Server (coût licences), NoSQL (inadapté au relationnel RH) |
| D14 | **Templates de présentation en HTML/CSS/vanilla JS** (hors React) | 🟢 | Demande client : maquettes rapides et autonomes pour les réunions, indépendantes du build applicatif | Maquettes dans le build Next.js (plus lourd pour itérer en réunion) |
| D15 | **Industrialiser le front** : i18n (next-intl), pagination/virtualisation serveur, tests | 🟢 | Indispensable à l'échelle 5 000 employés et multi-pays | Garder l'état prototype (ne tient pas la charge) |

---

## Décisions encore ouvertes (⚪ à trancher)

- **Identité air-gap** : Entra direct (Cas A) vs AD FS vs Keycloak — dépend de la sortie Internet de l'intranet (cf. SSO doc).
- **Orchestration runtime** : Docker Compose (simple) vs k3s (HA) — dépend de l'exigence de haute disponibilité.
- **Multi-langue** : FR seul ou FR/EN — dépend de l'existence de filiales anglophones.
- **Hébergement de la BDD** : centralisé (1 pays) + accord de transfert intra-groupe, vs distribué par pays — décision juridique + DSI.
