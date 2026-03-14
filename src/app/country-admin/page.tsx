"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell, LogOut, BarChart3, Users, User,
    MapPin, AlertCircle, FileText, Map, PieChart, Home, ChevronRight,
    Presentation, BarChart2, Building2, CheckSquare,
    Calendar, CheckCircle, X as XIcon, Clock, Lock, Unlock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { MyProfileMockup } from '@/components/mockups/MyProfileMockup';
import { MyTeamMockup } from '@/components/mockups/MyTeamMockup';
import { NineBoxModal } from '@/components/NineBoxModal';
import { SiteManagementView } from '@/components/mockups/SiteManagementView';
import { useUser, ALL_USERS } from '@/context/UserContext';
import { NotificationBell } from '@/components/NotificationBell';
import { UserAvatar } from '@/components/UserAvatar';
import { DownloadGuideButton } from '@/components/DownloadGuideButton';
import { NavButtons } from '@/components/NavButtons';

type ViewMode = 'MY_PROFILE' | 'MY_TEAM' | 'COUNTRY_ADMIN' | 'COUNTRY_MGMT' | 'RAPPORT_PILOTAGE_PAYS';

export default function CountryAdminDashboard() {
    const router = useRouter();
    const { currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>('COUNTRY_ADMIN');
    const [showNineBox, setShowNineBox] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // ─── Période d'évaluation ────────────────────────────────────────────────
    const [campaignLabel, setCampaignLabel] = useState('Campagne 2026');
    const [campaignStart, setCampaignStart] = useState('');
    const [campaignEnd, setCampaignEnd] = useState('');
    const [savedPeriod, setSavedPeriod] = useState<{ label: string; startDate: string; endDate: string } | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('eval_period');
        if (raw) {
            try {
                const p = JSON.parse(raw);
                setSavedPeriod(p);
                setCampaignLabel(p.label || 'Campagne 2026');
                setCampaignStart(p.startDate || '');
                setCampaignEnd(p.endDate || '');
            } catch { /* ignore */ }
        }
    }, []);

    const handleSavePeriod = () => {
        if (!campaignStart || !campaignEnd) { showToast('Veuillez renseigner les deux dates.', 'warning'); return; }
        if (campaignEnd <= campaignStart) { showToast('La date de clôture doit être postérieure à l\'ouverture.', 'warning'); return; }
        const period = { label: campaignLabel || 'Campagne 2026', startDate: campaignStart, endDate: campaignEnd };
        localStorage.setItem('eval_period', JSON.stringify(period));
        setSavedPeriod(period);
        showToast(`Campagne "${period.label}" activée du ${new Date(campaignStart).toLocaleDateString('fr-FR')} au ${new Date(campaignEnd).toLocaleDateString('fr-FR')}`, 'success');
    };

    const handleClearPeriod = () => {
        localStorage.removeItem('eval_period');
        setSavedPeriod(null);
        setCampaignStart('');
        setCampaignEnd('');
        showToast('Campagne clôturée. Les auto-évaluations sont verrouillées.', 'warning');
    };

    const periodStatus = () => {
        if (!savedPeriod) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const start = new Date(savedPeriod.startDate);
        const end = new Date(savedPeriod.endDate);
        if (today < start) return { label: `Programmée — s'ouvre le ${start.toLocaleDateString('fr-FR')}`, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', Icon: Clock };
        if (today > end) return { label: 'Clôturée', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', Icon: Lock };
        return { label: 'En cours ✓', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: Unlock };
    };

    // Initiales et nom dynamiques
    const initiales = currentUser?.nom_prenoms
        ? currentUser.nom_prenoms.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'CQ';
    const nomAffiche = currentUser
        ? `${currentUser.nom_prenoms} (${currentUser.pays})`
        : 'Utilisateur';

    // Rôles dynamiques selon l'utilisateur
    const isGeneralGroupe = currentUser?.usercount === 'Employe.10087@company.com';
    const roleTitleUI = isGeneralGroupe ? 'Coordinateur General Groupe' : 'Coordinateur / DRH Pays';
    const roleReportGeneral = isGeneralGroupe ? 'Coordinateur General Groupe' : 'Coordinateur Pays';
    const roleReportSign = isGeneralGroupe ? 'Coordinateur General Groupe' : 'Coordinateur Pays / DRH';

    // ─── Sites dynamiques depuis ALL_USERS ──────────────────────────────────
    const paysActuel = currentUser?.pays ?? '';
    // Scopes distincts des utilisateurs du même pays (hors "groupe")
    const sitesSet = new Set(
        ALL_USERS
            .filter(u => u.pays === paysActuel && u.scope !== 'groupe')
            .map(u => u.scope.charAt(0).toUpperCase() + u.scope.slice(1))
    );
    const sitesLabel = sitesSet.size > 0
        ? `${paysActuel} (${Array.from(sitesSet).join(', ')})`
        : paysActuel || 'Non défini';
    const flagEmoji = paysActuel === "Cote d'Ivoire" ? '🇨🇮'
        : paysActuel === 'Guinee' ? '🇬🇳'
            : paysActuel === 'Mali' ? '🇲🇱'
                : paysActuel === 'Senegal' ? '🇸🇳'
                    : '🌍';

    // ─── Génération du Rapport (PDF) ───────────────────────────────────────────
    const generatePaysReport = () => {
        const dateNow = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const coordinateur = currentUser?.nom_prenoms ?? '—';

        if (isGeneralGroupe) {
            // Stats Groupe Consolide
            const paysList = ["Côte d'Ivoire", "Mali", "Sénégal", "Guinée"];
            const effectifsPays = [540, 400, 310, 200];
            const evalsPays = [499, 320, 310, 150];
            const pourcentages = [92, 80, 100, 75];

            const totalEffectif = effectifsPays.reduce((a, b) => a + b, 0);
            const totalEvalues = evalsPays.reduce((a, b) => a + b, 0);
            const avancementGlobal = Math.round((totalEvalues / totalEffectif) * 100);

            const paysRows = paysList.map((p, i) => `
                <tr>
                    <td><strong>${p}</strong></td>
                    <td style="text-align:center;"><strong>${effectifsPays[i]}</strong></td>
                    <td style="text-align:center;"><strong>${evalsPays[i]}</strong></td>
                    <td style="text-align:center;">
                        <div class="progress-bar-bg" style="margin-bottom:4px;"><div class="progress-bar-fill" style="width:${pourcentages[i]}%;background:${pourcentages[i] >= 90 ? '#16a34a' : pourcentages[i] >= 75 ? '#d97706' : '#dc2626'};"></div></div>
                        <span class="badge ${pourcentages[i] >= 90 ? 'badge-green' : pourcentages[i] >= 75 ? 'badge-amber' : 'badge-red'}">${pourcentages[i]}%</span>
                    </td>
                </tr>
            `).join('');

            const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport de Supervision Corica Group</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    @page { margin: 15mm; size: A4 portrait; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; color: #334155; font-size: 11px; background: #e2e8f0; line-height: 1.5; padding: 20px; }
    .page-container { background: #fff; max-width: 800px; margin: 0 auto; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; border-top: 8px solid #F26322; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 900; color: #463738; letter-spacing: -0.5px; }
    .logo span { color: #F26322; }
    .meta { text-align: right; font-size: 10px; color: #64748b; line-height: 1.6; }
    .meta strong { color: #463738; font-weight: 700; }
    .report-title { font-size: 18px; font-weight: 900; color: #463738; text-transform: uppercase; text-align: center; margin-bottom: 5px; letter-spacing: 1px; }
    .report-sub { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 25px; font-weight: 500; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
    .kpi { border: 1px solid #f1f5f9; border-radius: 10px; padding: 15px; text-align: center; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .kpi-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; }
    .kpi-value { font-size: 28px; font-weight: 900; color: #463738; }
    .charts-container { display: flex; gap: 20px; margin-bottom: 40px; }
    .chart-box { flex: 1; border: 1px solid #f1f5f9; border-radius: 10px; padding: 15px; background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); page-break-inside: avoid; }
    .chart-box canvas { max-height: 100%; width: 100%; object-fit: contain; }
    .section-title { background: linear-gradient(135deg, #463738 0%, #2d2324 100%); color: #fff; font-weight: 700; font-size: 11px; padding: 10px 15px; text-transform: uppercase; border-radius: 8px 8px 0 0; letter-spacing: 0.5px; border-bottom: 3px solid #F26322; page-break-after: avoid; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; border: 1px solid #f1f5f9; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
    th { background: #f8fafc; color: #463738; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 12px 15px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px 15px; font-size: 11px; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 500; }
    tr:last-child td { border-bottom: none; }
    .progress-bar-bg { background: #e2e8f0; border-radius: 4px; height: 6px; width: 100%; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
    .progress-bar-fill { height: 100%; border-radius: 4px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-green { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; box-shadow: 0 1px 2px rgba(22,163,74,0.1); }
    .badge-amber { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; box-shadow: 0 1px 2px rgba(217,119,6,0.1); }
    .badge-red   { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; box-shadow: 0 1px 2px rgba(220,38,38,0.1); }
    .signature-zone { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 30px; }
    .sig-box { border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; background: #f8fafc; }
    .sig-label { font-size: 9px; font-weight: 700; color: #463738; text-transform: uppercase; margin-bottom: 8px; }
    .sig-name { font-size: 11px; color: #F26322; font-weight: 700; margin-bottom: 25px; }
    .sig-line { border-top: 1px solid #cbd5e1; font-size: 9px; color: #94a3b8; padding-top: 5px; }
    .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
    table { page-break-inside: avoid; }
    @media print { body { background: #fff; padding: 0; } .page-container { box-shadow: none; border: none; padding: 0; border-top: none; } .chart-box, .kpi, table { box-shadow: none !important; } -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
<div class="page-container">
  <div class="header">
    <div class="logo">CORICA <span>TALENT QUANTUM</span></div>
    <div class="meta">Date : ${dateNow}<br/>Édité par : <strong>${coordinateur}</strong></div>
  </div>

  <div class="report-title">Rapport de Supervision Corica Group</div>
  <div class="report-sub">Consolidation Globale des Campagnes d'Évaluation par Pays</div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Pays Couverts</div>
      <div class="kpi-value">${paysList.length}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Effectif Global</div>
      <div class="kpi-value">${totalEffectif}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Avancement Global</div>
      <div class="kpi-value">${avancementGlobal}%</div>
    </div>
  </div>

  <div class="charts-container">
    <div class="chart-box">
      <div style="position: relative; padding: 0; width: 100%; height: 220px;">
        <canvas id="barChart"></canvas>
      </div>
    </div>
    <div class="chart-box">
      <div style="position: relative; padding: 0; width: 100%; height: 220px;">
        <canvas id="doughnutChart"></canvas>
      </div>
    </div>
  </div>

  <div class="section-title">Analyse Consolidée par Pays</div>
  <table>
    <thead><tr><th>Pays</th><th style="text-align:center;">Effectif</th><th style="text-align:center;">Évalués</th><th style="text-align:center;">Taux d'Achèvement</th></tr></thead>
    <tbody>${paysRows}</tbody>
  </table>

  <div class="signature-zone">
    <div class="sig-box">
      <div class="sig-label">Coordinateur General Groupe</div>
      <div class="sig-name">${coordinateur}</div>
      <div class="sig-line">Visa &amp; Date</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Super Administrateur</div>
      <div class="sig-name">&mdash;</div>
      <div class="sig-line">Visa &amp; Date</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Chief People Officer</div>
      <div class="sig-name">&mdash;</div>
      <div class="sig-line">Visa &amp; Date</div>
    </div>
  </div>

  <div class="footer">
    CORICA MINING SERVICES &mdash; Rapport Consolidé Confidentiel &mdash; 9-Box Talent Management
  </div>
</div>
  <script>
    window.onload = function() {
      var ctxBar = document.getElementById('barChart').getContext('2d');
      new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(paysList)},
          datasets: [{
            label: 'Taux avancement (%)',
            data: ${JSON.stringify(pourcentages)},
            backgroundColor: [
              'rgba(242, 99, 34, 0.85)',
              'rgba(154, 151, 80, 0.85)',
              'rgba(70, 55, 56, 0.85)',
              'rgba(234, 179, 8, 0.85)'
            ],
            borderColor: ['#F26322', '#9A9750', '#463738', '#eab308'],
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Avancement par Pays', font: {size: 10} } }, scales: { y: { max: 100 } } }
      });

      var ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
      new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: ${JSON.stringify(paysList)},
          datasets: [{
            data: ${JSON.stringify(effectifsPays)},
            backgroundColor: [
              'rgba(242, 99, 34, 0.9)',
              'rgba(154, 151, 80, 0.9)',
              'rgba(70, 55, 56, 0.9)',
              'rgba(234, 179, 8, 0.9)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Répartition Effectifs', font: {size: 10} }, legend: { position: 'bottom', labels: {font: {size: 9}, padding: 10} } } }
      });

      // Délai pour laisser les graphiques se rendre
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 800);
    };
  </script>
</body>
</html>`;
            const win = window.open('', '_blank', 'width=1000,height=750');
            if (win) { win.document.write(html); win.document.close(); }
            return;
        }

        const pays = currentUser?.pays ?? 'Côte d\'Ivoire';

        // Sites construits dynamiquement depuis les scopes du pays
        const sitesData = Array.from(sitesSet).map((site, i) => {
            const effectif = ALL_USERS.filter(u => u.pays === pays && u.scope.toLowerCase() === site.toLowerCase()).length;
            const admins = ALL_USERS.filter(u => u.pays === pays && u.scope.toLowerCase() === site.toLowerCase() && u.interface_utilisateur === 'administrator');
            const adminName = admins.length > 0 ? admins[0].nom_prenoms : coordinateur;
            const avancement = [95, 100, 65, 80, 90][i % 5];
            const alertes = avancement < 80 ? `${Math.floor((100 - avancement) / 5)} (Retards)` : avancement < 100 ? '2 (Override)' : '0';
            const alerteColor = avancement < 80 ? '#d97706' : avancement < 100 ? '#dc2626' : '#16a34a';
            return { nom: `Site ${site}`, admin: adminName, effectif: effectif || 10, avancement, alertes, alerteColor };
        });
        const SITES = sitesData.length > 0 ? sitesData : [
            { nom: 'Site Principal', admin: coordinateur, effectif: 50, avancement: 75, alertes: '5 (Retards)', alerteColor: '#d97706' },
        ];
        const totalEffectif = SITES.reduce((s, x) => s + x.effectif, 0);
        const avancementGlobal = Math.round(SITES.reduce((s, x) => s + x.avancement * x.effectif, 0) / totalEffectif);

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport Pays — ${pays}</title>
  <style>
    @page { margin: 18mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d2d2d; font-size: 12px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #F26322; padding-bottom: 14px; margin-bottom: 22px; }
    .logo { font-size: 22px; font-weight: 900; color: #463738; }
    .logo span { color: #F26322; }
    .logo-sub { font-size: 11px; color: #9A9750; font-weight: 700; display: block; margin-top: 2px; }
    .meta { text-align: right; font-size: 11px; color: #888; line-height: 1.7; }
    .report-title { font-size: 18px; font-weight: 900; color: #463738; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin-bottom: 6px; }
    .report-sub { text-align: center; font-size: 12px; color: #888; margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
    .kpi-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
    .kpi-value { font-size: 28px; font-weight: 900; color: #463738; }
    .kpi-note { font-size: 10px; color: #9A9750; font-weight: 600; margin-top: 4px; }
    .section-title { background: #463738; color: #fff; font-weight: 700; font-size: 11px; padding: 8px 14px; text-transform: uppercase; letter-spacing: .5px; border-radius: 6px 6px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 6px 6px; overflow: hidden; }
    th { background: #F26322; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 9px 12px; text-align: left; }
    td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #f9fafb; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-amber { background: #fef3c7; color: #d97706; }
    .badge-red   { background: #fee2e2; color: #dc2626; }
    .progress-bar-bg { background: #e5e7eb; border-radius: 4px; height: 8px; width: 100%; overflow: hidden; }
    .progress-bar-fill { height: 100%; border-radius: 4px; }
    .synthese { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; background: #fffbf7; }
    .synthese h3 { font-size: 13px; font-weight: 700; color: #463738; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .synthese p { font-size: 11px; color: #555; line-height: 1.8; }
    .signature-zone { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; }
    .sig-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center; }
    .sig-label { font-size: 10px; font-weight: 700; color: #463738; text-transform: uppercase; margin-bottom: 4px; }
    .sig-name { font-size: 11px; color: #555; margin-bottom: 28px; }
    .sig-line { border-top: 1px solid #ccc; font-size: 10px; color: #aaa; padding-top: 5px; }
    .footer { margin-top: 20px; border-top: 2px solid #463738; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">CORICA <span>TALENT QUANTUM</span><span class="logo-sub">RH &amp; 9-BOX TALENT MANAGEMENT</span></div>
    </div>
    <div class="meta">
      Date : ${dateNow}<br/>
      Coordinateur Pays : <strong>${coordinateur}</strong><br/>
      Périmètre : <strong>${pays}</strong>
    </div>
  </div>

  <div class="report-title">Rapport de Supervision Nationale</div>
  <div class="report-sub">Campagne d'évaluation ${pays} — Synthèse Pays consolidée par le DRH</div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Sites Supervisés</div>
      <div class="kpi-value">${SITES.length}</div>
      <div class="kpi-note">${pays}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Total Talents</div>
      <div class="kpi-value">${totalEffectif}</div>
      <div class="kpi-note">Tous sites confondus</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Avancement Global</div>
      <div class="kpi-value">${avancementGlobal}%</div>
      <div class="kpi-note">Moy. pondérée par effectif</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Alertes Audit</div>
      <div class="kpi-value" style="color:#dc2626;">${SITES.reduce((s, x) => s + parseInt(x.alertes), 0)}</div>
      <div class="kpi-note">Overrides + Retards</div>
    </div>
  </div>

  <div class="section-title">&#9650; Consolidation par Site</div>
  <table>
    <thead>
      <tr>
        <th>Site Corica</th>
        <th>Admin Local (RRH)</th>
        <th style="text-align:center;">Effectif</th>
        <th style="text-align:center;">Avancement</th>
        <th style="text-align:center;">Alertes Audit</th>
      </tr>
    </thead>
    <tbody>
      ${SITES.map(s => `
        <tr>
          <td><strong>${s.nom}</strong></td>
          <td>${s.admin}</td>
          <td style="text-align:center;"><strong>${s.effectif}</strong></td>
          <td style="text-align:center;">
            <div class="progress-bar-bg" style="margin-bottom:4px;"><div class="progress-bar-fill" style="width:${s.avancement}%;background:${s.avancement >= 90 ? '#16a34a' : s.avancement >= 70 ? '#d97706' : '#dc2626'};"></div></div>
            <span class="badge ${s.avancement >= 90 ? 'badge-green' : s.avancement >= 70 ? 'badge-amber' : 'badge-red'}">${s.avancement}%</span>
          </td>
          <td style="text-align:center;color:${s.alerteColor};font-weight:700;">${s.alertes}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="synthese">
    <h3>📋 Commentaires du Coordinateur Pays &mdash; DRH ${pays}</h3>
    <p>
      La campagne d'évaluation nationale affiche un avancement global de <strong>${avancementGlobal}%</strong>.
      La Mine de Tongon a atteint <strong>100%</strong> de ses évaluations sans alertes.
      La Mine de Yaoué présente 2 cas d'override nécessitant une validation DRH.
      Le site HQ Abidjan enregistre <strong>15 retards</strong> qui requièrent une relance immédiate des managers locaux.
    </p>
  </div>

  <div class="signature-zone">
    <div class="sig-box">
      <div class="sig-label">Validé par le Coordinateur Pays / DRH</div>
      <div class="sig-name">${coordinateur}</div>
      <div class="sig-line">Date &amp; Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Visa Group HR Manager</div>
      <div class="sig-name">&mdash;</div>
      <div class="sig-line">Date &amp; Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Tampon Administrateur Système</div>
      <div class="sig-name">&mdash;</div>
      <div class="sig-line">Date &amp; Tampon</div>
    </div>
  </div>

  <div class="footer">
    <span>CORICA MINING SERVICES &mdash; Système RH &amp; 9-Box Talent Management</span>
    <span>Document confidentiel &mdash; Usage interne uniquement</span>
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=1000,height=750');
        if (win) { win.document.write(html); win.document.close(); }
    };

    // ─── Vue : Rapport de Pilotage Pays ──────────────────────────────────────────
    const renderRapportPilotagePays = () => {
        // Données fictives pour la démonstration
        const statsSites = [
            { nom: "Bureau d'Abidjan", effectif: 120, evalues: 110, pourcentage: 91 },
            { nom: 'Ity', effectif: 180, evalues: 170, pourcentage: 94 },
            { nom: 'Sissengué', effectif: 90, evalues: 85, pourcentage: 94 },
            { nom: 'Tongon', effectif: 150, evalues: 134, pourcentage: 89 },
            { nom: 'Yamoussoukro', effectif: 60, evalues: 0, pourcentage: 0 }
        ];

        const effectifTotal = statsSites.reduce((acc, site) => acc + site.effectif, 0);
        const effectifEvalue = statsSites.reduce((acc, site) => acc + site.evalues, 0);
        const ratioGlobal = Math.round((effectifEvalue / effectifTotal) * 100) || 0;

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30">
                    <div>
                        <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-3">
                            <Presentation className="text-[#F26322]" size={28} /> Rapport de Pilotage Pays ({paysActuel})
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">
                            Reporting global de l'évaluation annuelle consolidé pour tous les sites et départements.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI Global */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F26322]/30 flex flex-col justify-center items-center text-center col-span-1">
                        <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide mb-4">Ratio Global Pays Évalué</h3>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="#F26322" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ratioGlobal) / 100} />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-[#463738]">{ratioGlobal}%</span>
                            </div>
                        </div>
                        <p className="mt-4 font-bold text-[#463738] text-sm">{effectifEvalue} / {effectifTotal} collaborateurs évalués</p>
                    </div>

                    {/* Breakdown par Site */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#A39D98]/20 bg-[#463738]/5">
                            <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                <Map size={20} className="text-[#9A9750]" /> Effectif & Pourcentage d'Évaluation par Site
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            {statsSites.map((site, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-[#463738]">{site.nom}</span>
                                        <div className="flex items-center gap-4 text-[#A39D98]">
                                            <span>{site.evalues} / {site.effectif} évalués</span>
                                            <span className={`px-2 py-0.5 rounded text-xs text-white ${site.pourcentage === 100 ? 'bg-emerald-600' : site.pourcentage > 70 ? 'bg-[#9A9750]' : 'bg-red-600'}`}>
                                                {site.pourcentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-[#E3E1DB] h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${site.pourcentage === 100 ? 'bg-emerald-600' : site.pourcentage > 70 ? 'bg-[#9A9750]' : 'bg-red-600'}`}
                                            style={{ width: `${site.pourcentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ajout Breakdown par Département multi-sites (facultatif mais consolide) */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#A39D98]/20 bg-[#f9f9f9]">
                        <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                            <BarChart2 size={20} className="text-[#F26322]" /> Consolidation par Département (Tous sites)
                        </h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#463738] text-white">
                            <tr>
                                <th className="px-6 py-3 font-bold uppercase">Département</th>
                                <th className="px-6 py-3 font-bold uppercase text-center">Effectif Total</th>
                                <th className="px-6 py-3 font-bold uppercase text-center">Évalués</th>
                                <th className="px-6 py-3 font-bold uppercase text-center">Taux d'Achèvement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3E1DB]">
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-[#463738]">Opérations Minières</td>
                                <td className="px-6 py-4 text-center">210</td>
                                <td className="px-6 py-4 text-center">200</td>
                                <td className="px-6 py-4 text-center font-bold text-emerald-600">95%</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-[#463738]">Maintenance</td>
                                <td className="px-6 py-4 text-center">150</td>
                                <td className="px-6 py-4 text-center">120</td>
                                <td className="px-6 py-4 text-center font-bold text-[#9A9750]">80%</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-[#463738]">HQ & Support</td>
                                <td className="px-6 py-4 text-center">180</td>
                                <td className="px-6 py-4 text-center">179</td>
                                <td className="px-6 py-4 text-center font-bold text-emerald-600">99%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const VIEWS = ['MY_PROFILE', 'MY_TEAM', 'COUNTRY_ADMIN', 'COUNTRY_MGMT', 'RAPPORT_PILOTAGE_PAYS'] as const;
    type CountryView = typeof VIEWS[number];
    const currentViewIndex = VIEWS.indexOf(viewMode as CountryView);
    const handlePrevView = () => setViewMode(VIEWS[currentViewIndex > 0 ? currentViewIndex - 1 : VIEWS.length - 1] as any);
    const handleNextView = () => setViewMode(VIEWS[currentViewIndex < VIEWS.length - 1 ? currentViewIndex + 1 : 0] as any);

    return (
        <div className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden">
            {showNineBox && <NineBoxModal onClose={() => setShowNineBox(false)} />}
            {/* Topbar */}
            <header className="h-[76px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <NavButtons onPrev={handlePrevView} onNext={handleNextView} />
                    <CoricaLogo className="h-10 w-auto" />
                    <div className="flex flex-col justify-center mr-4">
                        <h1 className="text-[19px] text-[#463738] font-extrabold tracking-tight leading-none uppercase">Talent Quantum <span className="text-[#F26322]">v8.0</span></h1>
                        <p className="text-[10px] text-[#A39D98] font-bold tracking-widest uppercase">Country Coordination</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                    <span className="bg-[#F26322]/10 text-[#F26322] border border-[#F26322]/30 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">{roleTitleUI}</span>
                    <DownloadGuideButton />
                    <NotificationBell />
                    <div className="flex items-center gap-2">
                        <UserAvatar nom={currentUser?.nom_prenoms ?? ''} size={34} textClassName="text-xs" />
                        <span className="text-[#463738] font-medium">{nomAffiche}</span>
                    </div>
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 ml-4 px-3 py-1.5 border border-[#F26322] text-[#F26322] rounded hover:bg-[#F26322]/10 transition-colors font-medium">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            </header>

            {/* Scope Identifier Banner (Pays) */}
            <div className="bg-[#E3E1DB]/60 border-b border-[#A39D98]/30 px-8 py-3 flex justify-between items-center text-[14px]">
                <div className="flex items-center gap-3 text-[#463738]">
                    <Map className="text-[#F26322]" size={18} />
                    <span className="font-bold tracking-wide">Périmètre Multi-Sites (Pays) :</span>
                    <span className="bg-white px-3 py-1 rounded font-bold text-sm border border-[#A39D98]/30 text-[#463738] shadow-sm">{flagEmoji} {sitesLabel}</span>
                </div>
                <div className="text-xs font-bold text-[#A39D98] flex items-center gap-2 bg-white px-3 py-1 rounded-md shadow-sm border border-[#A39D98]/20">
                    <FileText size={14} className="text-[#9A9750]" /> Agrégation Pays Active
                </div>
            </div>

            {/* View Switcher Banner */}
            <div className="bg-white px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#A39D98]/30 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#A39D98]">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#F26322] transition-colors"><Home size={15} className="mb-0.5" /> 🏠 Page d'accueil Country Admin</span>
                    <ChevronRight size={14} />
                    <span className="text-[#463738]">
                        {viewMode === 'MY_PROFILE' && 'Mon Profil (Évalué)'}
                        {viewMode === 'MY_TEAM' && 'Mon Équipe Directe'}
                        {viewMode === 'COUNTRY_ADMIN' && 'Pilotage Pays'}
                        {viewMode === 'COUNTRY_MGMT' && 'Gestion Bureau Pays'}
                        {viewMode === 'RAPPORT_PILOTAGE_PAYS' && 'Rapport de Pilotage Pays'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[14px]">
                    <span className="font-bold text-[#A39D98] mr-2">Espace :</span>
                    <button
                        onClick={() => setViewMode('MY_PROFILE')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_PROFILE' ? 'bg-[#9A9750] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <User size={18} /> Mon Profil (Évalué)
                    </button>
                    <button
                        onClick={() => setViewMode('MY_TEAM')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'MY_TEAM' ? 'bg-[#463738] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Users size={18} /> Mon Équipe Directe
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setViewMode('COUNTRY_ADMIN')}
                        className={`px-5 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${viewMode === 'COUNTRY_ADMIN' ? 'bg-[#F26322] text-white shadow-md' : 'text-[#463738] hover:bg-[#E3E1DB]'}`}
                    >
                        <Map size={18} /> Pilotage Pays
                    </button>
                    <div className="h-6 w-px bg-[#A39D98]/30 mx-2"></div>
                    <button
                        onClick={() => setShowNineBox(true)}
                        className="px-5 py-2 font-bold rounded-lg flex items-center gap-2 bg-gradient-to-r from-[#463738] to-[#F26322] text-white shadow-md hover:opacity-90"
                    >
                        <BarChart2 size={18} /> 9-Box Talents
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 max-w-[1300px] mx-auto w-full">
                {viewMode === 'COUNTRY_ADMIN' && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-[28px] font-bold text-[#463738] mb-1">Supervision de la Campagne Nationale</h2>
                                <p className="text-[#A39D98] text-[15px]">Suivez et consolidez l'avancement des campagnes d'évaluation de tous les sites sous votre tutelle.</p>
                            </div>
                            <button
                                onClick={generatePaysReport}
                                className="bg-[#463738] text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm active:scale-95">
                                <FileText size={16} /> Générer le Rapport Pays (PDF)
                            </button>
                        </div>

                        {/* National KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col hover:border-[#F26322]/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide">Sites Supervisés</h3>
                                    <MapPin size={20} className="text-[#9A9750]" />
                                </div>
                                <span className="text-4xl font-black text-[#463738]">3</span>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col hover:border-[#F26322]/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide">Total Talents</h3>
                                    <Users size={20} className="text-[#F26322]" />
                                </div>
                                <span className="text-4xl font-black text-[#463738]">540</span>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/30 flex flex-col hover:border-[#F26322]/50 transition-colors col-span-2">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-sm font-bold text-[#A39D98] uppercase tracking-wide">Avancement Global (Pays)</h3>
                                    <PieChart size={20} className="text-[#F26322]" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-black text-[#463738]">82%</span>
                                    <span className="text-sm font-bold text-emerald-600 mb-1">Phase de validation RRH Sites</span>
                                </div>
                                <div className="w-full bg-[#E3E1DB] h-2.5 rounded-full mt-4 overflow-hidden relative">
                                    <div className="bg-gradient-to-r from-[#F26322] to-[#9A9750] h-full" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration Campagne d'Évaluation */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#F26322]/30 p-6 mb-8">
                            <h3 className="font-bold text-[#463738] text-[15px] mb-1 flex items-center gap-2">
                                <Calendar size={18} className="text-[#F26322]" /> Configuration de la Campagne d&apos;Évaluation
                            </h3>
                            <p className="text-xs text-[#A39D98] mb-5">Ouvrez ou clôturez la période d&apos;auto-évaluation pour tous les collaborateurs du pays.</p>

                            {(() => {
                                const status = periodStatus();
                                if (!status) return null;
                                const StatusIcon = status.Icon;
                                return (
                                    <div className={`mb-4 rounded-xl px-4 py-3 flex items-center justify-between border ${status.bg} ${status.border}`}>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon size={16} className={status.color} />
                                            <div>
                                                <p className={`text-sm font-black ${status.color}`}>{savedPeriod?.label}</p>
                                                <p className={`text-xs mt-0.5 ${status.color} opacity-80`}>
                                                    {status.label} · Du {new Date(savedPeriod!.startDate).toLocaleDateString('fr-FR')} au {new Date(savedPeriod!.endDate).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={handleClearPeriod} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1.5">
                                            <XIcon size={13} /> Clôturer
                                        </button>
                                    </div>
                                );
                            })()}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Libellé</label>
                                    <input type="text" value={campaignLabel} onChange={e => setCampaignLabel(e.target.value)}
                                        placeholder="Ex: Campagne 2026"
                                        className="w-full px-3 py-2.5 rounded-lg border border-[#E3E1DB] bg-[#f8f7f5] text-[14px] text-[#463738] font-semibold outline-none focus:border-[#F26322] focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Date d&apos;ouverture</label>
                                    <input type="date" value={campaignStart} onChange={e => setCampaignStart(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[#E3E1DB] bg-[#f8f7f5] text-[14px] text-[#463738] outline-none focus:border-[#F26322] focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#A39D98] uppercase tracking-wider mb-1.5">Date de clôture</label>
                                    <input type="date" value={campaignEnd} onChange={e => setCampaignEnd(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[#E3E1DB] bg-[#f8f7f5] text-[14px] text-[#463738] outline-none focus:border-[#F26322] focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button onClick={handleSavePeriod}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#F26322] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm">
                                    <CheckCircle size={16} /> Activer la campagne
                                </button>
                            </div>
                        </div>

                        {/* Actions principales */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 p-6 mb-8">
                            <h3 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                                <User size={18} className="text-[#F26322]" /> Actions principales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Gestion des Sites */}
                                <button
                                    onClick={() => setViewMode('COUNTRY_MGMT')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #F26322 0%, #463738 100%)' }}
                                >
                                    <Building2 size={22} /> Gestion Bureau Pays
                                </button>
                                {/* Équipes */}
                                <button
                                    onClick={() => setViewMode('MY_TEAM')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #9A9750 0%, #463738 100%)' }}
                                >
                                    <Users size={22} /> Équipes Nationales
                                </button>
                                {/* Révisions RH */}
                                <button
                                    onClick={() => {
                                        setViewMode('MY_TEAM');
                                        showToast('Filtre activé : Employés en attente de révision RH', 'warning');
                                    }}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #463738 0%, #F26322 100%)' }}
                                >
                                    <CheckSquare size={22} /> Révisions RH
                                </button>
                                {/* Rapport de pilotage pays */}
                                <button
                                    onClick={() => setViewMode('RAPPORT_PILOTAGE_PAYS')}
                                    className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl font-bold text-[15px] text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
                                    style={{ background: 'linear-gradient(135deg, #9A9750 0%, #463738 100%)' }}
                                >
                                    <Presentation size={22} /> Rapport de pilotage pays
                                </button>
                            </div>
                        </div>

                        {/* Breakdown per Site */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#A39D98]/30 overflow-hidden mb-8">
                            <div className="p-6 border-b border-[#A39D98]/20 flex justify-between items-center bg-[#E3E1DB]/20">
                                <h3 className="font-bold text-lg text-[#463738] flex items-center gap-2">
                                    <BarChart3 size={20} className="text-[#9A9750]" /> Consolidation par Site
                                </h3>
                                <button onClick={() => { setViewMode('RAPPORT_PILOTAGE_PAYS'); showToast('Affichage du rapport de pilotage national consolidé', 'success'); }} className="text-sm font-bold text-[#463738] border border-[#A39D98]/40 px-3 py-1.5 rounded-lg hover:bg-white hover:border-[#F26322] transition-colors flex items-center gap-1 bg-white active:scale-95">
                                    <CheckSquare size={16} className="text-[#F26322]" /> Voir la Synthèse 9-Box Nationale
                                </button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-[#463738] text-white">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider">Site Corica</th>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider">Admin Local (RRH)</th>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider text-center">Effectif</th>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider text-center">Évaluation Terminée</th>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider text-center">Alertes Audit</th>
                                        <th className="px-6 py-4 font-bold text-[13px] uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3E1DB]">
                                    <tr className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 text-[#463738] font-black font-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#F26322]"></span> Bureau d'Abidjan
                                        </td>
                                        <td className="px-6 py-5 text-[#A39D98] font-bold">Vous-même</td>
                                        <td className="px-6 py-5 text-center font-bold text-[#463738]">120</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">91%</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-[#A39D98]">
                                            0
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => { setViewMode('COUNTRY_MGMT'); showToast('Basculement sur l\'administration du site : Bureau d\'Abidjan', 'success'); }} className="text-[#F26322] hover:underline font-bold text-sm">Examiner Site</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 text-[#463738] font-black font-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#9A9750]"></span> Ity
                                        </td>
                                        <td className="px-6 py-5 text-[#A39D98] font-bold">Amadou T.</td>
                                        <td className="px-6 py-5 text-center font-bold text-[#463738]">180</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">94%</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-red-600">
                                            2 (Override)
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => { setViewMode('COUNTRY_MGMT'); showToast('Basculement sur l\'administration du site : Ity', 'success'); }} className="text-[#F26322] hover:underline font-bold text-sm">Examiner Site</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 text-[#463738] font-black font-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#463738]"></span> Sissengué
                                        </td>
                                        <td className="px-6 py-5 text-[#A39D98] font-bold">Kadiatou B.</td>
                                        <td className="px-6 py-5 text-center font-bold text-[#463738]">90</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">94%</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-[#A39D98]">
                                            0
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => { setViewMode('COUNTRY_MGMT'); showToast('Basculement sur l\'administration du site : Sissengué', 'success'); }} className="text-[#F26322] hover:underline font-bold text-sm">Examiner Site</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 text-[#463738] font-black font-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#F26322]"></span> Tongon
                                        </td>
                                        <td className="px-6 py-5 text-[#A39D98] font-bold">Marc D.</td>
                                        <td className="px-6 py-5 text-center font-bold text-[#463738]">150</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">89%</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-amber-600">
                                            15 (Retards)
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => { setViewMode('COUNTRY_MGMT'); showToast('Basculement sur l\'administration du site : Tongon', 'success'); }} className="text-[#F26322] hover:underline font-bold text-sm">Examiner Site</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 text-[#463738] font-black font-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#9A9750]"></span> Yamoussoukro
                                        </td>
                                        <td className="px-6 py-5 text-[#A39D98] font-bold">Jean C.</td>
                                        <td className="px-6 py-5 text-center font-bold text-[#463738]">60</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">0%</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-red-600">
                                            Non démarré
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => { setViewMode('COUNTRY_MGMT'); showToast('Basculement sur l\'administration du site : Yamoussoukro', 'success'); }} className="text-[#F26322] hover:underline font-bold text-sm">Examiner Site</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {viewMode === 'MY_PROFILE' && (
                    <MyProfileMockup />
                )}

                {viewMode === 'MY_TEAM' && (
                    <MyTeamMockup />
                )}

                {viewMode === 'COUNTRY_MGMT' && (
                    <SiteManagementView onBack={() => setViewMode('COUNTRY_ADMIN')} />
                )}

                {viewMode === 'RAPPORT_PILOTAGE_PAYS' && renderRapportPilotagePays()}
            </main>
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 border ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    toastMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {toastMessage.type === 'success' && <CheckSquare size={20} className="text-emerald-500" />}
                    {toastMessage.type === 'warning' && <AlertCircle size={20} className="text-amber-500" />}
                    {toastMessage.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
                    <span className="font-bold text-[14px]">{toastMessage.message}</span>
                </div>
            )}
        </div >
    );
}
