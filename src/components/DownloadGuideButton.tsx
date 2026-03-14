"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function DownloadGuideButton() {
    const { currentUser } = useUser();
    const roleName = currentUser?.interface_utilisateur || 'Utilisateur';

    const generateGuide = () => {
        const dateNow = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Manuel de l'Utilisateur - Corica Talent Quantum</title>
    <style>
        @page { margin: 25mm 20mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d2d2d; line-height: 1.6; font-size: 13px; background-color: #f9fafb; margin: 0; }
        .page-break { page-break-before: always; }
        .container { max-width: 900px; margin: 0 auto; background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        
        /* En-tête */
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #F26322; padding-bottom: 20px; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: 900; color: #463738; letter-spacing: -0.5px; }
        .logo-sub { font-size: 13px; color: #9A9750; font-weight: 700; display: block; letter-spacing: 1.5px; margin-top: -5px; }
        .doc-meta { text-align: right; font-size: 12px; color: #666; line-height: 1.4; }
        
        /* Titres */
        .title-page { text-align: center; margin: 80px 0 100px 0; }
        .title-page h1 { font-size: 36px; color: #463738; text-transform: uppercase; margin-bottom: 15px; border-bottom: none; line-height: 1.2; }
        .title-page p { color: #666; font-size: 18px; font-weight: 300; }
        
        h1 { font-size: 24px; color: #463738; border-bottom: 3px solid #463738; padding-bottom: 10px; margin: 40px 0 20px 0; text-transform: uppercase; }
        h2 { font-size: 18px; color: #F26322; margin: 30px 0 15px 0; display: flex; align-items: center; gap: 10px; }
        h3 { font-size: 15px; color: #9A9750; margin: 20px 0 10px 0; font-weight: bold; background: #fdfaf6; padding: 5px 10px; border-left: 4px solid #9A9750; }
        
        /* Contenu */
        p { margin-bottom: 15px; text-align: justify; }
        ul, ol { margin-left: 20px; margin-bottom: 20px; padding-left: 15px; }
        li { margin-bottom: 8px; }
        
        /* Boîtes et alertes */
        .box { background: #fdfaf6; border-left: 5px solid #F26322; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .box-title { font-weight: bold; color: #F26322; margin-bottom: 10px; font-size: 15px; text-transform: uppercase; }
        
        .role-badge { display: inline-block; background: #463738; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; vertical-align: middle; margin-right: 10px; }
        
        /* Tableaux */
        table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th { background: #463738; color: white; text-align: left; padding: 12px; font-size: 12px; font-weight: bold; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; vertical-align: top; }
        tr:nth-child(even) { background-color: #f9fafb; }
        
        .timeline { padding-left: 20px; border-left: 2px solid #F26322; margin: 20px 0; position: relative; }
        .timeline-item { position: relative; margin-bottom: 25px; padding-left: 15px; }
        .timeline-item::before { content: ''; position: absolute; left: -26px; top: 2px; width: 10px; height: 10px; background: #fff; border: 3px solid #F26322; border-radius: 50%; }
        
        /* Mockups UI */
        .mockup { border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; }
        .mock-header { background: #463738; color: #fff; padding: 10px 15px; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        .mock-body { display: flex; height: 180px; }
        .mock-sidebar { width: 150px; background: #f9fafb; border-right: 1px solid #e5e7eb; padding: 15px 10px; }
        .mock-sidebar-item { background: #e5e7eb; height: 20px; border-radius: 4px; margin-bottom: 10px; }
        .mock-sidebar-item.active { background: #F26322; }
        .mock-content { flex: 1; padding: 15px; background: #fff; }
        .mock-item { background: #f3f4f6; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #9A9750; }
        .mock-btn { display: inline-block; background: #F26322; color: #fff; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .mock-caption { text-align: center; font-size: 11px; color: #888; padding: 8px; font-style: italic; border-top: 1px solid #eee; background: #fcfcfc; }
        .mock-split { display: flex; gap: 10px; height: 150px; padding: 15px; }
        .mock-list { flex: 1; border: 1px solid #eee; border-radius: 4px; padding: 10px; }
        .mock-detail { flex: 2; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: #f3f4f6; }
        .mock-modal { position: absolute; top: 20px; left: 50px; right: 50px; bottom: 20px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border-radius: 8px; border-top: 4px solid #F26322; padding: 15px; z-index: 10;}

        .footer { margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 11px; color: #888; }
        
        @media print { 
            body { background-color: white; }
            .container { padding: 0; box-shadow: none; }
            -webkit-print-color-adjust: exact; print-color-adjust: exact; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CORICA MINING SERVICES</div>
            <div class="doc-meta">
                <strong>MANUEL COMPLET DE L'UTILISATEUR</strong><br/>
                Version 3.0 (Mise à jour détaillée)<br/>
                Édition du : ${dateNow}<br/>
                Généré pour le profil : <strong>${roleName}</strong>
            </div>
        </div>

        <div class="title-page">
            <h1>Plateforme Digitale Quantum PERFORMANCE & TALANT MANAGEMENT</h1>
            <p>Guide Méthodologique Exhaustif : Processus, Interfaces et Rôles</p>
        </div>

        <div class="mockup" style="background:#E3E1DB; padding:20px;">
            <div style="background:white; border-bottom:1px solid #A39D98; padding:10px 20px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:black; color:#463738; font-size:16px;">CORICA TALENT QUANTUM <span style="font-size:9px; color:#F26322;">Espace de Démonstration v8.0</span></div>
            </div>
            <div style="text-align:center; padding:20px 0;">
                <h3 style="color:#463738; font-size:18px; margin-bottom:5px;">Bienvenue dans l'environnement de Test</h3>
                <p style="color:#A39D98; font-size:12px;">Sélectionnez le rôle que vous souhaitez simuler pour votre présentation.</p>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #eee; display:flex; gap:10px;">
                    <div style="width:30px; height:30px; background:#9A9750; border-radius:6px;"></div>
                    <div><div style="font-weight:bold; font-size:11px; color:#463738;">Mon Profil</div><div style="font-size:9px; color:#A39D98;">Vue de l'employé avec le module de co-construction...</div></div>
                </div>
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #eee; display:flex; gap:10px;">
                    <div style="width:30px; height:30px; background:#F26322; border-radius:6px;"></div>
                    <div><div style="font-weight:bold; font-size:11px; color:#463738;">Espace Manager (Évaluateur N+1)</div><div style="font-size:9px; color:#A39D98;">Gestion de l'équipe, évaluation et validation...</div></div>
                </div>
                <div style="background:white; padding:10px; border-radius:8px; border:1px solid #eee; display:flex; gap:10px;">
                    <div style="width:30px; height:30px; background:#9A9750; border-radius:6px;"></div>
                    <div><div style="font-weight:bold; font-size:11px; color:#463738;">Superviseur de Niveaux (Comité N+2)</div><div style="font-size:9px; color:#A39D98;">Arbitrage et Calibration des placements...</div></div>
                </div>
                 <div style="background:white; padding:10px; border-radius:8px; border:1px solid #eee; display:flex; gap:10px;">
                    <div style="width:30px; height:30px; background:#463738; border-radius:6px;"></div>
                    <div><div style="font-weight:bold; font-size:11px; color:#463738;">Administrateur Site Local (RRH)</div><div style="font-size:9px; color:#A39D98;">Pilotage d'une campagne précise...</div></div>
                </div>
            </div>
            <div class="mock-caption" style="background:transparent; border:none; margin-top:10px;">Illustration : Le Portail d'Accueil et la sélection des rôles (Page Principale de l'Application)</div>
        </div>

        <div class="page-break"></div>

        <!-- PAGE 3: THEORIE & SYSTEME GLOBAL -->
        <h1>2. Architecture Globale et Chronologie du Processus</h1>
        <p>Le système <strong>Corica Talent Quantum</strong> est architecturé autour d'un flux de travail (workflow) chronologique et hiérarchique strict. Le processus de Performance et de Gestion des Talents ne peut avancer qu'en respectant les étapes de validation.</p>
        
        <div class="timeline">
            <div class="timeline-item">
                <span style="font-weight:bold; color:#463738;">ÉTAPE 1 : Fixation des Objectifs par l'Employé</span>
                <p style="font-size:11px; margin-top:5px; color:#666;">En début d'année, l'employé saisit ses KPIs (Objectifs de Performance) sur la plateforme. Il définit le nom, la description détaillée, la méthode de mesure, le délai, et le poids (qui doit obligatoirement totaliser 100%).</p>
            </div>
            <div class="timeline-item">
                <span style="font-weight:bold; color:#463738;">ÉTAPE 2 : Validation par le Manager (N+1)</span>
                <p style="font-size:11px; margin-top:5px; color:#666;">Le Manager reçoit une notification. Il examine le "Contrat d'Objectifs" rédigé par l'employé. Il peut approuver les objectifs un à un, ou demander des modifications. Une fois approuvés, les objectifs sont dits « Verrouillés ».</p>
            </div>
            <div class="timeline-item">
                <span style="font-weight:bold; color:#463738;">ÉTAPE 3 : L'Auto-Évaluation par l'Employé</span>
                <p style="font-size:11px; margin-top:5px; color:#666;">En fin d'année, l'employé complète son auto-évaluation. Le système débloque la possibilité de s'attribuer une note allant de 1 (Faible) à 4 (Excellent) pour chaque objectif, et de joindre des justificatifs (Livrables PDF/Excel) et commentaires.</p>
            </div>
            <div class="timeline-item">
                <span style="font-weight:bold; color:#463738;">ÉTAPE 4 : L'Évaluation Finale & Algorithme 9-Box par le Manager N+1</span>
                <p style="font-size:11px; margin-top:5px; color:#666;">Le manager valide ensuite la Performance (Axe Y) de manière définitive. Mais surtout, il est contraint de répondre au Questionnaire de Potentiel à 16 critères (Axe X). Dès la soumission, l'algorithme "Quantum" projette l'employé sur la matrice 9-Box.</p>
            </div>
            <div class="timeline-item">
                <span style="font-weight:bold; color:#463738;">ÉTAPE 5 : Comité de Calibration (Superviseur N+2)</span>
                <p style="font-size:11px; margin-top:5px; color:#666;">La direction audite l'ensemble de la grille de son département. Si un biais est détecté, le N+2 a la capacité de forcer (écraser) la décision de l'algorithme pour ajuster équitablement le placement d'un employé.</p>
            </div>
        </div>

        <div class="page-break"></div>

        <!-- PAGE 4: L'EMPLOYE - PAGE D'ACCUEIL & PROFIL -->
        <h1>3. Rôle Détaillé : Mon Profil</h1>
        <p>L'interface de l'employé est le point d'entrée pour la majorité des utilisateurs de l'entreprise. Elle est conçue pour être intuitive, sans menu latéral complexe, favorisant l'accès direct aux tâches.</p>
        
        <h2>3.1. L'Écran d'Accueil et la Barre Supérieure (Topbar)</h2>
        <p>Une fois connecté, la <strong>Topbar</strong> (en-tête) reste toujours visible. Elle affiche le logo Corica, la version du système, ainsi que la photo de profil, le nom de l'utilisateur et un bouton déroulant pour changer le statut (Profil Cadre ou Non-Cadre).</p>
        <p>Le corps de la page d'accueil affiche le titre "Mon Profil" et présente <strong>quatre tuiles géantes (boutons d'action)</strong> arborant chacune un gradient de couleur et une icône spécifique.</p>

        <div class="mockup" style="padding: 15px; background: #fff;">
            <div style="font-size:12px; font-weight:bold; color:#F26322; margin-bottom:10px;">👤 Actions principales</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div style="background: linear-gradient(to right, #8e8584, #4a3f3d); color:white; padding:15px; border-radius:6px; font-weight:bold; font-size:11px; text-align:center;">👤 Mon profil</div>
                <div style="background: linear-gradient(to right, #b3b97b, #8f917b); color:white; padding:15px; border-radius:6px; font-weight:bold; font-size:11px; text-align:center;">📈 Mes objectifs de performance</div>
                <div style="background: linear-gradient(to right, #50443b, #9e9e5e); color:white; padding:15px; border-radius:6px; font-weight:bold; font-size:11px; text-align:center;">✓ Mon auto-évaluation</div>
                <div style="background: linear-gradient(to right, #ee7329, #53392d); color:white; padding:15px; border-radius:6px; font-weight:bold; font-size:11px; text-align:center;">📊 Dashboard de l'Employé</div>
            </div>
            <div class="mock-caption">Illustration : L'écran d'accueil exclusif de l'employé (Tuiles d'accès rapide).</div>
        </div>

        <h2>3.2. La Fenêtre "Mon Profil"</h2>
        <p>Lorsqu'un employé clique sur la première tuile <strong>👤 Mon profil</strong>, une grande fenêtre s'ouvre. Ce module est purement informatif, l'essentiel des données étant verrouillées (issues du SIRH) :</p>
        <ul>
            <li><strong>Encadré "Informations Personnelles" :</strong> Champs affichés : <em>Matricule (Grigé), Nom et Prénoms, Date de naissance, Usercount (Email professionnel), Numéro de téléphone</em>. Seuls certains champs (téléphone, date de naissance) peuvent être modifiés par l'employé.</li>
            <li><strong>Encadré "Informations Professionnelles" :</strong> Affiche le descriptif métier : <em>Fonction / Poste Occupé, Date d'Embauche, Département, Service / Scope d'Affectation, Pays.</em></li>
            <li><strong>Encadré "Manager Direct (N+1)" :</strong> Affiche le nom, l'email et la fonction de <u>l'Évaluateur</u> qui sera chargé de valider ses objectifs. Un encadré en bas affiche également l'identité du N+2 (Calibration).</li>
        </ul>
        <p>L'employé doit valider que ces informations sont correctes au premier trimestre. S'il constate une erreur hiérarchique (mauvais manager N+1 assigné), il doit contacter le service RH (Administrateur) pour régularisation avant de remplir ses objectifs.</p>

        <div class="page-break"></div>

        <!-- PAGE 5: L'EMPLOYE - OBJECTIFS -->
        <h1>3. Rôle Détaillé : Mon Profil (Suite)</h1>

        <h2>3.3. La Fenêtre "Mes objectifs de performance (KPI)"</h2>
        <p>C'est le module névralgique du début d'année. En cliquant sur la deuxième tuile <strong>📈 Mes objectifs de performance</strong>, l'utilisateur accède à un tableau de bord dynamique listant les futurs objectifs qu'il souhaite fixer.</p>
        
        <p><strong>Comportement de l'Interface Visuelle :</strong> L'interface prend la forme d'un tableau vierge ou pré-rempli (brouillons). Les colonnes, dotées d'en-têtes foncées (vert ou gris) décrivent :</p>
        <ul>
            <li><strong>Nom Objectif :</strong> Un champ texte court (ex: "Améliorer le taux de disponibilité parc camion").</li>
            <li><strong>Description :</strong> Une large zone de texte (textarea) où l'employé décrit ce qu'il va faire.</li>
            <li><strong>Critères de Mesure :</strong> Une zone de texte expliquant l'indicateur mathématique de succès (ex: "Mesuré par le système de pointage avec une cible de >95%").</li>
            <li><strong>Délai :</strong> Un sélecteur de date interactif (calendrier).</li>
            <li><strong>Poids % :</strong> Un champ numérique obligatoire permettant d'indiquer l'importance de ce KPI sur 100%.</li>
            <li><strong>Bouton (Corbeille) :</strong> Supprime l'objectif de la ligne correspondante.</li>
        </ul>

        <div class="box">
            <div class="box-title">Règle Algorithmique Stricte (Le Poids des 100%)</div>
            <p style="margin:0; font-size:12px;">En bas du tableau, le système calcule le "Total Poids". L'employé ne peut soumettre ses objectifs à son manager QUE SI (et seulement si) la somme des champs "Poids" est strictement égale à 100%. Dans le cas contraire, le bouton "Soumettre au Manager" affichera une erreur bloquante en texte rouge.</p>
        </div>

        <p><strong>Validation et Soumission :</strong></p>
        <p>En dessous du tableau d'édition, l'employé a un champ "Commentaires de l'Employé" s'il souhaite joindre une note explicative à son manager. Ensuite, il dispose de deux boutons stratégiques :</p>
        <ol>
            <li><strong>Bouton "Enregistrer" (Orange) :</strong> Permet de sauvegarder le travail comme brouillon. Le Manager ne reçoit aucune alerte.</li>
            <li><strong>Bouton "Soumettre au Manager" (Vert) :</strong> Une fois le total à 100% atteint, ce bouton fige le tableau (Read-Only) et envoie la notification formelle à l'Évaluateur N+1 qui le verra atterrir dans sa "Inbox".</li>
        </ol>

        <div class="page-break"></div>

        <!-- PAGE 6: L'EMPLOYE - EVALUATION & VAULT -->
        <h1>3. Rôle Détaillé : Mon Profil (Fin)</h1>

        <h2>3.4. La Fenêtre "Mon Auto-Évaluation"</h2>
        <p>En fin d'année, l'employé clique sur <strong>✓ Mon auto-évaluation</strong>. Ce bouton n'est déverrouillé que si le manager a formellement approuvé les objectifs lors de l'étape précédente.</p>
        <p>Le formulaire affiché reprend avec précision, en lecture seule (sans pouvoir les modifier), les objectifs (KPIs) saisis en début d'année (dans les colonnes gauches). En revanche, trois nouvelles colonnes interactives apparaissent à droite :</p>
        <ul>
            <li><strong>Évaluation (Auto-notation) :</strong> Une interface à 4 Étoiles (⭐). L'employé clique sur les étoiles pour s'attribuer une note allant de 1 (Faible) à 4 (Excellent).</li>
            <li><strong>Livrables (Preuves) :</strong> Un bouton de téléchargement de fichier sous forme de zone parsemée (Upload Box). L'utilisateur peut cliquer pour téléverser un rapport PDF, Excel ou Word qui viendra prouver l'atteinte de son objectif.</li>
            <li><strong>Commentaires :</strong> Une zone de texte à remplir pour justifier les difficultés, les victoires ou justifier la note.</li>
        </ul>
        <p>En basculant sur le bouton <strong>"Soumettre l'évaluation"</strong>, tout est verrouillé et le relais passe définitivement au Manager N+1.</p>

        <h2>3.5. La Fenêtre "Dashboard & Data Vault"</h2>
        <p>Le bouton <strong>📊 Dashboard de l'Employé</strong> est un espace d'archivage (Data Vault) et de suivi. À l'intérieur de cette fenêtre massive, l'employé retrouve :</p>
        <ul>
            <li><strong>Des Graphiques Analytiques :</strong> Un histogramme illustrant l'historique de ses notes comparé à la moyenne du département, et un diagramme en camembert de son avancée des objectifs.</li>
            <li><strong>L'onglet Data Vault (Coffre-fort Numérique) :</strong> Des tuiles (fichiers) prêtes à être téléchargées. Elles contiennent ses contrats et évaluations PDF scellées des années précédentes. Si aucune historique n'est présent (ex. nouveau salarié), les boutons sont désactivés/grisés avec la mention "Aucun document".</li>
            <li><strong>La table "Suivi des Actions" :</strong> Un tableau de suivi d'avancement des objectifs (Jalon, Date, Statut - <em>Terminé, En cours, À venir</em>). L'employé peut y poinçonner des commentaires en direct pour créer de la visibilité pour lui-même et pour son manager.</li>
        </ul>

        <div class="page-break"></div>

        <!-- PAGE 7: LE MANAGER N+1 -->
        <h1>4. Rôle Détaillé : Le Manager (Évaluateur N+1)</h1>
        <p>L'interface du Manager N+1, contrairement à celle de l'employé, adopte une ergonomie professionnelle plus dense connue sous le nom de <strong>CORICA Talent Cloud</strong>. Elle s'articule autour d'une colonne de navigation sombre (Sidebar) ancrée sur la gauche de l'écran.</p>

        <h2>4.1. L'Interface (Sidebar) de Navigation</h2>
        <p>La Sidebar propose une série de menus permanents facilitant le pilotage direct de son équipe :</p>
        <ul>
            <li><strong>📊 Vue Globale :</strong> Le tableau de bord principal. C'est ici que l'arrivée est effectuée. Il affiche la liste tabulaire de tous les membres de "Mon Équipe Directe". Pour chaque employé, le manager voit son matricule, le poste, le degré de finalité du processus RH (Statuts comme <em>"NOT_STARTED", "KPI_SUBMITTED", "EVAL_COMPLETED"</em>) et de petits boutons d'action d'accès rapide.</li>
            <li><strong>🔲 Calibration (9-Box) :</strong> Accès direct au graphique représentant la "Mapping" de la performance et du potentiel de ses employés évalués.</li>
            <li><strong>📥 Inbox & Approbations :</strong> La boîte de réception managériale. Elle permet de suivre la demande d'action en cours : Les objectifs qui viennent d'être envoyés par les employés et nécessitant validation sont empilés ici.</li>
        </ul>

        <h2>4.2. Validation des Objectifs (KPIs)</h2>
        <p>Lorsque le Manager observe l'état "KPI_SUBMITTED" dans la liste de ses collaborateurs, un bouton orange "Réviser KPIs" devient actif à côté du nom de l'agent. En cliquant :</p>
        <p>La fenêtre modale s'ouvre, superposée à l'écran. Le Manager observe un tableau Read-Only avec tous les objectifs définis par son employé (Nom, Description, Poids...). Pour chaque ligne, le système impose au manager d'interagir avec une colonne <strong>"Approbation"</strong>.</p>
        <p>Le manager doit obligatoirement cliquer sur l'un des deux boutons :</p>
        <ul>
            <li><strong>"Valider" (Vert) :</strong> L'objectif est validé, gravé, impossible de revenir en arrière pour l'employé.</li>
            <li><strong>"Demander Modif" (Rouge) :</strong> Bloque le processus, et impose au Manager d'écrire une raison dans la boîte de commentaires RH. L'objectif sera renvoyé à l'employé qui devra le corriger et le re-soumettre.</li>
        </ul>
        <p>Une fois qu'une action est prise pour TOUS les KPIs, le bouton "Soumettre Décisions" en bas de page est actif. Le statut de l'employé passe alors de "KPI_SUBMITTED" à "KPI_APPROVED".</p>


        <div class="page-break"></div>

        <!-- PAGE 8: LE MANAGER EVALUATION ET MATRICE -->
        <h1>4. Rôle Détaillé : Le Manager N+1 (L'Évaluation & La Matrice)</h1>

        <h2>4.3. Déclenchement de la Performance et du Potentiel</h2>
        <p>Une fois qu'un employé a réalisé formellement son auto-évaluation en fin d'année, son compte-rendu arrive au N+1 avec le bouton final : <strong>"Démarrer l'Évaluation"</strong> (statut formel SELF_EVAL_DONE).</p>
        
        <p>C'est l'étape la plus sensible et la plus méthodologique de toute la plateforme. La "Talent Matrix" s'active pour forger le score définitif de l'employé à travers l'interaction de deux fenêtres divisées.</p>

        <div class="box">
            <div class="box-title">La Rigueur de la Talents-Matrix</div>
            <p style="margin:0; font-size:12px;">Le Manager est enfermé dans une modale. Il est scrupuleusement contraint par la plateforme de renseigner l'Axe des Ordonnées (Axe Y = Performance des MBO) ET l'Axe des Abscisses (Axe X = Questionnaire de compétences cachées) pour que l'algorithme "Quantum" projette le talent.</p>
        </div>

        <h3>A. Évaluation de la Performance (La Moitié de l'équation)</h3>
        <p>Le manager affiche les objectifs fixés. Pour chaque objectif, en dessous de "l'Auto-note de l'employé", il voit le bouton d'Évaluation Managériale (4 Étoiles). Il va fixer la note finale allant de "Faible" à "Excellent". Cette somme des étoiles crée un score global appelé <strong>"P-Score" (Performance Score)</strong>, et valide la donnée de façon irrévocable (axe vertical).</p>

        <h3>B. Le Questionnaire de Potentiel à 16 Critères (L'autre Moitié)</h3>
        <p>Sur l'autre onglet, l'utilisateur n'évalue plus l'atteinte mathématique, mais le comportement soft-skills de l'agent. Le <strong>Questionnaire est long, imposant et composé de 16 affirmations fixes imposées par les RH</strong> (ex: "Cette personne fait preuve de leadership émotionnel", "Cette personne s'adapte aux changements").</p>
        <p>Pour chaque affirmation (1 à 16), le manager doit impérativement choisir (boutons radios en cascade) :</p>
        <ul>
            <li><strong>Rarement (1 point)</strong></li>
            <li><strong>Parfois (2 points)</strong></li>
            <li><strong>Souvent (3 points)</strong></li>
        </ul>
        <p>Si et seulement si le M-Score (performance) ET les 16 scores comportementaux (Potentiel) sont intégralement remplis, le bouton "Générer la Matrice & Enregistrer" devient disponible et clique. L'algorithme calcule la moyenne P et Potentiel, la croise dans sa cartographie mathématique interne, et génère le placement aveugle final (exemple: Le système place l'agent dans la cellule "HIGH PERFORMER").</p>


        <div class="page-break"></div>

        <!-- PAGE 9: LE ROLE N+2 CALIBRATION -->
        <h1>5. Rôle Détaillé : Superviseur (Comité Calibration N+2)</h1>
        <p>Le Manager N+2, c'est-à-dire le directeur de programme métier ou de direction (Head of Department), dispose d'un rôle d'audit de cohésion de l'ensemble.</p>
        
        <h2>5.1. La Vue Consolée (Dashboard Croisé)</h2>
        <p>L'interface N+2 reprend l'aspect sombre <strong>CORICA Talent Cloud</strong>. Cependant, dans le module <strong>Talent Matrix 9-Box</strong>, le N+2 ne voit pas que "sa" petite équipe. Il observe, empilée de façon globale, TOUTES les équipes des N+1 qui dépendent de lui, représentées sur un grand écran de Dashboard intelligent.</p>

        <p><strong>Composants du Dashboard N+2 :</strong></p>
        <ul>
            <li><strong>Barre de Filtres Intelligents (Top) :</strong> Une série de menus déroulants (Department, Position, Job Grade, Seniority, Site) permettant de filtrer massivement les agents.</li>
            <li><strong>Tableau de Bord / Visualisation Dynamique (Bas) :</strong> Une série de listes tabulaires classant sur un axe chaque employé avec le calcul absolu de ses résultats. Plus le score est élevé, plus le résultat crève le plafond.</li>
            <li><strong>Cartographie Dynamique 9-Box :</strong> Sur la droite du Dashboard, le système dresse un graphique vectoriel dessiné par l'algorithme sous forme d'une grande ligne connectant 9 gros pastilles de couleurs intenses (Orange vif, Or, Vert clair, Rouge-Gris) représentant les 9 "Cases/Méta-groupes" d'employés. Le système place une valeur chiffrée dans la pastille. (Exemple, la pastille rouge Star comportera "14" signalant qu'il y a 14 agents jugés "Star" dans la base de données). Si le N+2 clique sur la pastille "Star", la liste exhaustive des 14 personnes s'affiche instantanément.</li>
        </ul>

        <h2>5.2. Outil Critique de forçage RH : "Le Panneau de Calibration"</h2>
        <p>Par définition, une IA ou un algorithme est impersonnel ("Un biais managérial ou de clémence est possible"). C'est pourquoi le Manager N+2 organise un comité (réunion).</p>
        <p>S'il juge avec ses pairs qu'un agent placé en "AVERAGE PERFORMER" par l'algorithme suite aux notes du N+1 mérite d'être promu "HIGH POTENTIAL", il ouvre la <strong>Matrice de Calibration</strong>. Une fenêtre modale très sensible force le N+2 à justifier sa décision.</p>
        <ul>
            <li><strong>Le Sélecteur Dérogatoire :</strong> Affiche une option déroulante contenant la liste des 9 cases finales.</li>
            <li><strong>Le Registre (Logs) de Décision RH :</strong> Un champ textuel encadré en rouge où le N+2 doit saisir par écrit la ligne de justification validant l'override algorithmique pour les traces de l'inspection RH. Le clic sur "Appliquer" écrase instantanément l'algorithme du système central.</li>
        </ul>

        <div class="page-break"></div>

        <!-- PAGE 10: L'ADMINISTRATION RH GLOBALE -->
        <h1>6. Rôle Détaillé : Administration RH Globale (Site / Country)</h1>
        <p>Le module réservé à l'adresse Usercount <strong>Administrateur Site Local (RRH)</strong> contourne complètement le champ de l'évaluation chiffrée et de l'atteinte ou non des objectifs opérationnels. Les Administrateurs supervisent la plomberie du workflow de manière agnostique et assurent le bon déroulement temporel et organisationnel de la campagne RH.</p>

        <h2>6.1. La Vue de Gestion Paramétrique</h2>
        <p>L'interface de la Sidebar Administrateur propose un grand ensemble de paramétrage central (Base settings) inaccessibles aux autres niveaux :</p>

        <ul>
            <li><strong>Création Utilisateurs (Onboarding) :</strong> Les RH ou IT ont la lourde responsabilité d'injecter dans la base les profils du personnel. Les RH accèdent à une page d'ajout manuel. Plus finement, ils effectuent la liaison hiérarchique capitale (assigner M. Diakite à l'évaluateur N+1 [ID: 10565] de façon rigide). Si cette étape est faillée, le processus est brisé.</li>
            <li><strong>Pilotage Data Analytics :</strong> Les administrateurs disposent de tableaux de suivi avec camemberts avancés de supervision. Ce tableau de bord indique quel département a le meilleur taux de remplissage ou les alertes de retard (ex: 200/500 auto-évaluations soumises. 10 manquantes en Production avant date limite), et fournit des indicateurs critiques consolidés.</li>
        </ul>

        <h2>6.2. Le Panneau de Personnalisation Matériel ("Super-Paramètres")</h2>
        <p>Dans l'interface administrateur (ou N+2 via le bouton "Personnaliser"), une fenêtre modale complexe s'active. Elle permet la reprogrammation en direct des règles mêmes du jeu "Talent Quantum" appliquées à l'ensemble du site, modifiant globalement la matrice de calcul :</p>
        
        <ul>
            <li><strong>Palette et Nomenclature des Cases :</strong> Une grille pour redéfinir instantanément le nom exact (ex: changer "Solid Performer" en "Expert Référent") ou de changer les codes hexa de couleurs de chacune des 9 pastilles. L'ensemble de la plateforme (des écrans de base aux algorithmes) modifie globalement son design via ces variables dynamiques injectées.</li>
            <li><strong>Pondération Algorithmique de l'Axe X vs. Axe Y :</strong> Par l'usage de Jauges interactives (Slidings scales / Ranges), l'administrateur ajuste l'importance systémique : Doit-on donner 60% d'importance aux 16 critères comportementaux RH vs 40% sur la performance terrain du N+1 ? Ce changement redéfinit la matrice au quart de seconde suivant tout l'organigramme de Corica.</li>
            <li><strong>Mode Sandbox / Démo :</strong> Un indicateur signale à l'administrateur s'il joue en mode virtuel ou si ses paramètres forgeront officiellement les évaluations à l'instar d'une usine.</li>
        </ul>

        <div class="page-break"></div>

        <!-- THE 9 BOX EXPLAINED -->
        <h1>7. Annexe Définitive : Le Fonctionnement de la Matrice 9-Box Algo-Corica</h1>
        <p>Voici la correspondance exacte des règles fondamentales et des algorithmes régissant les 9 cases utilisées dans Quantum, s'appuyant rigoureusement sur les axes de <strong>Performance réelle constatée (Y)</strong> et de <strong>Potentiel (X - score des 16 critères de compétences "soft")</strong>.</p>
        
        <table style="margin-top:20px; text-align:center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; font-family: sans-serif; width: 100%;">
            <tr>
                <td style="background:#fbb923; color:#463738; border: 2px solid white; vertical-align:middle; width:33.3%; padding: 25px;"><strong>SOLID PERFORMER</strong><br/><sub style="display:block; margin-top:5px;">(Performance Élevée - Potentiel Faible)</sub></td>
                <td style="background:#a5a9ad; color:#463738; border: 2px solid white; vertical-align:middle; width:33.3%; padding: 25px;"><strong>HIGH PERFORMER</strong><br/><sub style="display:block; margin-top:5px;">(Performance Élevée - Potentiel Moyen)</sub></td>
                <td style="background:#ea5d1f; color:white; border: 2px solid white; font-weight:bold; vertical-align:middle; width:33.3%; padding: 25px;"><strong>STAR</strong><br/><sub style="display:block; margin-top:5px;">(Performance Élevée - Potentiel Élevé)</sub></td>
            </tr>
            <tr>
                <td style="background:#8ac63f; color:#463738; border: 2px solid white; vertical-align:middle; padding: 25px;"><strong>AVERAGE PERFORMER</strong><br/><sub style="display:block; margin-top:5px;">(Performance Moyenne - Potentiel Faible)</sub></td>
                <td style="background:#fbb923; color:#463738; border: 2px solid white; vertical-align:middle; padding: 25px;"><strong>CORE PLAYER</strong><br/><sub style="display:block; margin-top:5px;">(Performance Moyenne - Potentiel Moyen)</sub></td>
                <td style="background:#a5a9ad; color:#463738; border: 2px solid white; vertical-align:middle; padding: 25px;"><strong>HIGH POTENTIAL</strong><br/><sub style="display:block; margin-top:5px;">(Performance Moyenne - Potentiel Élevé)</sub></td>
            </tr>
            <tr>
                <td style="background:#ea5d1f; color:white; border: 2px solid white; font-weight:bold; vertical-align:middle; padding: 25px;"><strong>RISK</strong><br/><sub style="display:block; margin-top:5px;">(Performance Faible - Potentiel Faible)</sub></td>
                <td style="background:#8ac63f; color:#463738; border: 2px solid white; vertical-align:middle; padding: 25px;"><strong>INCONSISTENT PLAYER</strong><br/><sub style="display:block; margin-top:5px;">(Performance Faible - Potentiel Moyen)</sub></td>
                <td style="background:#fbb923; color:#463738; border: 2px solid white; vertical-align:middle; padding: 25px;"><strong>POTENTIAL GEM</strong><br/><sub style="display:block; margin-top:5px;">(Performance Faible - Potentiel Élevé)</sub></td>
            </tr>
        </table>
        
        <p style="text-align:justify; margin-top: 25px; font-size: 13px;">
            <strong>MÉCANIQUE DE PLACEMENT DU CALCULATEUR (Lignes de bascule) :</strong>
            L'algorithme analyse vos scores et opère des découpages matriciels automatiques.
            <br/><br/>
            - Pour atteindre un point d'entrée "Élevée" sur l'axe Y (Performance), la moyenne des évaluations MBO attribuable par le manager doit dépasser ou égaler l'indice pondéré de 3.5 étoiles sur 4. Ainsi, de strictes conditions dédient uniquement la case <strong>"STAR"</strong> aux scores excellents couplés à un score fort lors des réponses aux 16 exigences du questionnaire comportemental de l'axe X.
            <br/><br/>
            - Il est impossible pour un individu, quelle que soit la volonté managériale humaine, d'atterrir dans le coin Supérieur (STAR) si les données froides des KPIs n'ont pas validé ce seuil, à moins d'une levée explicite ("Force Override") réalisée lors des prestigieuses comités de calibration (Accès N+2 exclusivement).
        </p>

        <div class="footer">
            Corica Mining Services &middot; RH & Talent Management System<br/>
            Généré automatiquement par le portail Quantum v8.0, le ${dateNow}
        </div>
    </div>

    <script>
        setTimeout(() => {
            window.print();
        }, 500);
    </script>
</body>
</html>`;

        const newWin = window.open('', '_blank');
        if (newWin) {
            newWin.document.open();
            newWin.document.write(html);
            newWin.document.close();
        } else {
            alert("L'ouverture du guide a été bloquée par votre navigateur. Veuillez autoriser les pop-ups (fenêtres contextuelles) pour ce site.");
        }
    };

    return (
        <button
            onClick={generateGuide}
            className="flex items-center gap-2 text-[#463738] hover:text-[#F26322] font-semibold transition-colors px-3 py-1.5 rounded-md hover:bg-[#F26322]/10"
            title="Télécharger le Guide d'Utilisation"
        >
            <BookOpen size={18} />
            <span className="text-[13px] hidden sm:inline">Guide Global</span>
        </button>
    );
}
