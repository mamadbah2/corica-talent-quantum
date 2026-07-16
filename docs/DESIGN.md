# DESIGN — CORICA Talent Quantum

## Theme
**Clair.** Scène : un RRH de site relit les évaluations annuelles sur un écran de bureau en pleine journée ; un technicien tape son auto-évaluation sur une tablette kiosque dans une salle éclairée. Lumière ambiante forte → fond clair pour la lisibilité et la confiance institutionnelle. L'orange CORICA porte l'identité ; le sombre est réservé à des zones ponctuelles (rail de navigation profond).

## Color strategy — VERROUILLÉE (2026-07-07, décision user « une palette et s'y tenir »)
**Palette STRICTE : neutres chauds (brun) + orange.** RÈGLE DURE : **l'orange = ACTIONS uniquement** (boutons, nav active, liens, sélection, focus). Il ne code JAMAIS une donnée ni un statut.
- **Intensité de donnée** (9-box, niveaux de compétence, heatmaps) = **échelle séquentielle NEUTRE** (brun désaturé clair→foncé, tokens `.nb-l1..l4`). PAS de 4 teintes différentes (rejeté : « trop de couleur »).
- **Statuts** (clôturé / en cours / brouillon) = distingués par le **remplissage**, pas la couleur (plein foncé / contour+point / gris clair). Aucun vert/ambre/rouge.
- **Catégories 9-box** (Star/Core/Risk…) = mêmes tons neutres que la matrice.
- Seule exception éventuelle à rediscuter : un signal « risque/sécurité » si un besoin métier l'impose — sinon tout reste neutre.
- **GRAPHIQUES (décidé 2026-07-09)** : les dataviz (barres, donut, jauges) restent DANS LA CHARTE — **orange + tons bruns neutres UNIQUEMENT**. Le rouge, le vert, le bleu ne font PAS partie de la charte CORICA (rejetés explicitement par le user). Série focale / segment principal = `--corica-orange` ; segments/séries secondaires = échelle brune neutre (`--ink-soft`, `--ink-faint`, `--line`). C'est la seule zone où l'orange peut porter une donnée ; partout ailleurs orange = action.
- **Tableaux (décidé 2026-07-09)** : un seul style d'en-tête pour TOUS les tableaux = en-tête brun `--rail` + texte `--rail-ink` (défini dans `.table thead th` d'app.css, référence = tableau des objectifs). Uniformité stricte d'un écran à l'autre.
- **Texte sur fond orange (décidé 2026-07-10, audit design)** : JAMAIS de blanc sur orange (contraste 3.0:1, échoue WCAG AA). Le texte des surfaces orange (boutons primaires, nav active, pagination active, étape courante) = **brun encre profond `--on-orange` (oklch 0.200)**, contraste ≥4.5:1, gras. C'est la déclinaison accessible de « orange = action » validée par le user (« texte encre sur orange »). Réservé au blanc : uniquement les fonds sombres (`--ink`, `--rail`).
- **Dataviz — score isolé = donnée neutre** : une jauge/valeur de score global (ex. compétences 68%) est une DONNÉE → tracé neutre `--ink`, pas orange. L'orange focal des graphiques reste réservé aux séries/segments comparés (barres, donut), pas à un score-métrique unique (qui, lui, s'aligne sur le traitement neutre de la note d'auto-évaluation).

## Color tokens (OKLCH) — alignés sur l'identité réelle CORICA (voir `IDENTITE-VISUELLE-CORICA.md`)
```
/* Marque (couleurs exactes du site corica.com) */
--corica-orange:        oklch(0.685 0.188 45);   /* #F26322 — signature */
--corica-orange-strong: oklch(0.610 0.190 42);   /* hover/pressed */
--corica-orange-soft:   oklch(0.955 0.030 60);   /* fonds d'emphase */
--corica-brown:         oklch(0.360 0.015 30);   /* #463838 — brun terreux : texte & héros sombres */
/* PAS de vert de marque : #61A229 = bouton cookie tiers, pas CORICA. Marque = orange + brun + blanc. */

/* Neutres chauds (teintés brun, jamais #000/#fff) */
--bg:        oklch(0.984 0.004 60);   /* fond appli */
--surface:   oklch(1.000 0.002 60);   /* cartes/panneaux */
--surface-2: oklch(0.968 0.005 50);   /* zones secondaires (#F3F5F7) */
--ink:       oklch(0.360 0.015 30);   /* texte principal = brun marque #463838 */
--ink-soft:  oklch(0.520 0.012 40);   /* texte secondaire */
--line:      oklch(0.910 0.006 50);   /* bordures */
--rail:      oklch(0.330 0.018 35);   /* rail nav = brun profond (pas gris froid) */

/* États sémantiques 9-box / statuts — FONCTIONNELS (hors marque), volontairement désaturés */
--star:      oklch(0.620 0.090 145);  /* top talent / succès — vert MUET (pas un vert de marque) */
--core:      oklch(0.600 0.080 230);  /* core player — bleu muet */
--risk:      oklch(0.600 0.180 28);   /* risque — rouge-orangé (proche orange, cohérent) */
--warn:      oklch(0.760 0.130 80);   /* attention — ambre */
--ok:        oklch(0.620 0.090 145);  /* succès — vert muet */
```
> Note : les couleurs de statut sont **fonctionnelles**, désaturées pour ne pas concurrencer l'orange de marque. Les maquettes v1 (rail gris-bleu, « C » provisoire) sont à re-skiner : **rail brun `#463838`, vrai logo `brand-assets/corica-logo-*.svg`, titres condensés bicolores, photo duotone**.

## Typography — VERROUILLÉE (2026-07-06)
Polices de marque CORICA (kit Typekit du site) : **Antarctican Headline** (display) + **Korolev** (texte). ⚠️ Adobe Fonts, CDN, **non auto-hébergeables** en intranet/air-gap → substituts libres auto-hébergés (décision validée par le user après comparaison visuelle `brand-assets/corica-site/font-compare.html`) :
- **Titres / héros : `Anton`** (≈ Antarctican Headline — gothique lourd resserré). Fichier `maquettes/assets/fonts/Anton.woff2` (graisse unique 400). **Réservé aux GRANDS titres de page & héros, JAMAIS aux labels/boutons/données** (register = product). Capitales, bicolore blanc/orange sur héros.
- **Texte / UI : `Archivo`** (≈ Korolev). Fichier `Archivo-var.woff2` (variable 100–900). Porte corps, labels, boutons, tableaux. Corps 15–16px, lignes ≤72ch. Alternative plus proche de Korolev si besoin = Chivo.
- **Chiffres** en `tabular-nums` dans tableaux et 9-box. Hiérarchie par échelle + poids (ratio ≥1.25).
- Câblage : `--font-display: "Anton","Archivo",…` / `--font: "Archivo",…` / `.display{font-weight:400}` (Anton = graisse unique, ne pas forcer 700/800).

## Elevation & shape — VERROUILLÉE (2026-07-06)
- **TOUT CARRÉ — zéro border-radius** (décision user, aligné corica.com). Tokens `--r-lg/md/sm/pill: 0`. Angles nets partout : cartes, champs, boutons, toggles, badges, pastilles.
- Élévation **discrète** : ombres douces et basses (`0 1px 2px` + `0 8px 24px` très légère sur panneaux flottants), jamais de glassmorphism.
- Bordures pleines 1px (`--line`) — **jamais de bande latérale colorée** en accent (banni).

## Marque & iconographie — VERROUILLÉE (2026-07-06)
- **Vrai logo** partout : `brand-assets/corica-logo-white.svg` (rail brun / héros), `-dark.svg` (fond clair). Plus de « C » provisoire.
- **Icônes = Font Awesome** (jeu réel du site), auto-hébergées `brand-assets/fa/*.svg`. Plus de SVG dessinés main.
- **Photographie de marque** : portraits humains / terrain, tons naturels (PAS de wash orange ajouté), héros `brand-assets/hero-portrait.jpg`. Réservée aux héros (login, portail), pas dans les zones de travail denses.
- **Motif de marque** (chevrons de hachures `brand-assets/corica-pattern-strip.png`) = séparateur ponctuel, hauteur ≥28px sinon il devient du bruit. Jamais en papier peint 2D.

## Components (principes)
- **Rail de navigation** profond (`--rail`) à gauche, icônes + libellés, état actif en orange.
- **Tableaux** denses, en-têtes collants, lignes à fort contraste de survol, pagination serveur, chiffres alignés.
- **9-box** : grille 3×3, cellules à fond sémantique doux, pastilles employés déplaçables (drag), légende claire.
- **Badges de statut** : pills pleines à fond teinté (Brouillon / En cours / Clôturé).
- **Cibles tactiles** ≥44px (kiosque). Mode kiosque : typo plus grande, pavé PIN large.
- **Motion** : transitions courtes ease-out (≤200ms), aucune sur les propriétés de layout.
