# SSO Office 365 / Entra ID avec une application sur intranet

> **Question :** l'application est déployée sur l'**intranet** CORICA (on-premise). Comment fonctionne alors le **SSO avec Office 365** (dont les identités sont dans le **cloud** Microsoft Entra ID) ?

---

## 1. Le point clé à comprendre

Office 365 = cloud Microsoft. Les identités des employés CORICA vivent dans **Microsoft Entra ID** (ex-Azure AD), **dans le cloud**. L'application, elle, tourne **sur l'intranet**. Le SSO ne « rapatrie » pas Entra sur l'intranet : il fonctionne par **redirection du navigateur** vers Entra (protocole **OpenID Connect / OAuth 2.0**).

**Conséquence majeure : ce n'est pas le serveur applicatif qui doit forcément aller sur Internet — c'est surtout le _navigateur de l'utilisateur_ qui doit pouvoir joindre `login.microsoftonline.com`.**

---

## 2. Le flux SSO, étape par étape (Authorization Code + PKCE)

```
 Employé (navigateur, sur intranet)        App intranet (NestJS)        Entra ID (cloud O365)
        │                                         │                            │
   1.   │── ouvre https://talent.corica.local ───▶│                            │
   2.   │◀──── redirige vers Entra (authorize) ───│                            │
   3.   │──────────── login (ou session O365 déjà active = SSO transparent) ──▶│
   4.   │◀───────────── redirige vers l'app avec un "code" ───────────────────│
   5.   │── transmet le code à l'app ────────────▶│                            │
   6.   │                                         │── échange code↔tokens ────▶│
   7.   │                                         │◀── ID token + access token │
   8.   │◀── crée une SESSION serveur (cookie httpOnly) + mappe rôle CORICA ───│
        │                                         │
   9.   │═══════ navigation normale, authentifié, RBAC appliqué côté serveur ══│
```

- **Étape 3 = la magie du SSO** : si l'employé est déjà connecté à Office 365 (Outlook/Teams) dans son navigateur, Entra ne redemande **rien** → connexion transparente. Sinon il saisit ses identifiants Microsoft une seule fois.
- **Étape 6** : l'app (client confidentiel) échange le code contre les tokens via un **secret client ou un certificat**.
- **Étape 8** : l'app crée **sa propre session** (cookie sécurisé) et **mappe l'identité Entra → un utilisateur/rôle CORICA**. C'est ce qui remplace définitivement le `ALL_USERS` / `COR-123` actuel.

---

## 3. LA question décisive : l'intranet a-t-il accès à Internet ?

C'est ce qui détermine la faisabilité. **Trois cas :**

### ✅ Cas A — Intranet avec sortie Internet contrôlée (le plus courant)
Le réseau autorise, via proxy/pare-feu, l'accès aux **endpoints d'identité Microsoft** (`login.microsoftonline.com`, `login.microsoft.com`, `*.windows.net`).
→ **Le SSO Entra ID fonctionne directement.** Il suffit d'**autoriser (whitelister) ces domaines Microsoft** dans le pare-feu. **C'est la configuration recommandée et la plus simple.**

### ⚠️ Cas B — Intranet totalement air-gap (zéro Internet)
Le SSO cloud Entra est **impossible** (le navigateur ne peut pas joindre Microsoft). Alternatives :
- **AD FS** (Active Directory Federation Services) on-premise : si CORICA a un **AD local synchronisé** avec Entra (identité hybride), AD FS fournit un point de fédération **interne**. ⚠️ Microsoft pousse à migrer hors d'AD FS.
- **Keycloak** (fournisseur d'identité auto-hébergé) fédéré à l'**AD local via LDAP** : SSO **100 % on-prem**, sans dépendance cloud. Bonne option air-gap, mais identités séparées d'O365 (sauf synchro).

### ❓ Cas C — Sites miniers isolés / mode kiosque hors-ligne
Sur un site minier **sans connexion**, le SSO Entra ne marchera pas non plus.
→ Prévoir un **mécanisme de repli** pour les terminaux kiosque (auth locale mise en cache, ou file de synchronisation), **ou** garantir une connectivité minimale sur ces sites. **À cadrer dès la conception.**

---

## 4. Ce qu'il faut faire concrètement (Cas A, recommandé)

1. **Enregistrer l'application dans Entra ID** (portail Entra admin) :
   - Type : **Web / client confidentiel**.
   - **Redirect URI** = l'URL intranet de l'app (ex. `https://talent.corica.local/auth/callback`) — Entra accepte une URL non publique tant qu'elle est enregistrée et en **HTTPS**.
   - Générer un **secret client** (ou mieux, un **certificat**).
   - Permissions Microsoft Graph : `User.Read`, `GroupMember.Read.All` (pour récupérer les groupes/rôles).
2. **Configurer le mapping rôles** : créer des **groupes de sécurité Entra** (ex. `CORICA-Talent-SuperAdmin`, `-Manager`, `-Employee`) → l'app lit l'appartenance aux groupes et en déduit le **rôle RBAC**. (Remplace le mapping en dur actuel.)
3. **Côté app (NestJS)** : librairie OIDC (Auth.js / Passport-Azure-AD / MSAL Node), flux **Authorization Code + PKCE**, validation du **token** (signature via JWKS Microsoft, `issuer`, `audience`, `tenant`), création d'une **session cookie httpOnly/SameSite**.
4. **Sécurité Entra** : activer les **stratégies d'accès conditionnel** (MFA, conformité de l'appareil) — gérées par Entra, sans code côté app.

---

## 5. Bénéfices et points de sécurité

- ✅ **Plus aucun mot de passe géré par l'app** (fin du `COR-123`) — Entra gère identités, MFA, rotation, révocation.
- ✅ **SSO transparent** pour les employés déjà sur O365.
- ✅ **RBAC piloté par les groupes Entra** → cohérent avec la gouvernance IT.
- ⚠️ **Ne jamais stocker les tokens dans `localStorage`** côté navigateur → uniquement **cookies httpOnly** et session serveur.
- ⚠️ **Valider rigoureusement** le tenant (n'accepter que le tenant CORICA), l'audience et l'expiration des tokens.

---

## 6. Décision / à confirmer avec la DSI CORICA

| Question à la DSI | Pourquoi |
|---|---|
| L'intranet a-t-il une **sortie Internet** vers les endpoints Microsoft ? | Détermine Cas A vs B |
| Y a-t-il un **AD local synchronisé** avec Entra (identité hybride) ? | Conditionne l'option AD FS / repli air-gap |
| Quelle **connectivité sur les sites miniers** isolés ? | Conditionne le mode kiosque hors-ligne |
| Standard d'identité imposé (Entra direct / AD FS / Keycloak) ? | Choix du fournisseur d'identité |

> **Recommandation par défaut : Cas A — SSO Entra ID direct (OIDC), endpoints Microsoft autorisés au pare-feu.** C'est le plus simple, le plus sûr, et aligné avec un parc Office 365 existant. Repli Keycloak/AD FS uniquement si air-gap strict imposé.
