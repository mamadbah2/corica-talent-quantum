// ============================================================
// CORICA Talent Quantum — Utilitaire de génération PDF (window.print)
// ============================================================

export interface KpiRow {
  name?: string;
  desc?: string;
  measure?: string;
  deadline?: string;
  weight?: number;
}

export interface PrintEvalOptions {
  employeeName: string;
  employeeId: string;
  fonction: string;
  departement: string;
  site: string;
  pays: string;
  managerN1Name?: string;
  managerN2Name?: string;
  kpis: KpiRow[];
  evalScores?: Record<number, number>;
  evalComments?: Record<number, string>;
  campaignLabel?: string;
  printDate?: string;
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Faible',
  2: 'Passable',
  3: 'Bon',
  4: 'Excellent',
};

const stars = (score: number) =>
  [1, 2, 3, 4]
    .map(s => `<span style="color:${s <= score ? '#F26322' : '#ddd'}; font-size:18px;">★</span>`)
    .join('');

export function printEvaluationForm(opts: PrintEvalOptions, mode: 'objectives' | 'evaluation') {
  const w = window.open('', '', 'width=1100,height=900');
  if (!w) return;

  const date = opts.printDate ?? new Date().toLocaleDateString('fr-FR');
  const campaign = opts.campaignLabel ?? 'Campagne en cours';

  const kpisRows = opts.kpis
    .map((kpi, i) => {
      const score = opts.evalScores?.[kpi as any]?.score ?? opts.evalScores?.[i] ?? 0;
      const comment = opts.evalComments?.[i] ?? '';
      return mode === 'objectives'
        ? `<tr>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:700; color:#463738;">${kpi.name || `Objectif ${i + 1}`}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; color:#463738;">${kpi.desc || '—'}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; color:#463738;">${kpi.measure || '—'}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:center; color:#463738;">${kpi.deadline || '—'}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:center; font-weight:900; color:#F26322;">${kpi.weight ?? 0}%</td>
          </tr>`
        : `<tr>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; font-weight:700; color:#463738;">${kpi.name || `Objectif ${i + 1}`}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; color:#463738;">${kpi.desc || '—'}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:center;">${stars(score)}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:center; font-weight:700; color:${score >= 3 ? '#9A9750' : score >= 2 ? '#F26322' : '#ef4444'};">${SCORE_LABELS[score] ?? '—'}</td>
            <td style="padding:10px 12px; border-bottom:1px solid #eee; color:#A39D98; font-size:12px;">${comment || '—'}</td>
          </tr>`;
    })
    .join('');

  const tableHeaders =
    mode === 'objectives'
      ? `<tr style="background:#463738; color:white;">
          <th style="padding:12px; text-align:left;">Objectif</th>
          <th style="padding:12px; text-align:left;">Description</th>
          <th style="padding:12px; text-align:left;">Critères de mesure</th>
          <th style="padding:12px; text-align:center;">Échéance</th>
          <th style="padding:12px; text-align:center;">Poids</th>
        </tr>`
      : `<tr style="background:#463738; color:white;">
          <th style="padding:12px; text-align:left;">Objectif</th>
          <th style="padding:12px; text-align:left;">Description</th>
          <th style="padding:12px; text-align:center;">Évaluation</th>
          <th style="padding:12px; text-align:center;">Note</th>
          <th style="padding:12px; text-align:left;">Commentaires</th>
        </tr>`;

  const scores = Object.values(opts.evalScores ?? {});
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${mode === 'objectives' ? 'Fiche Objectifs' : 'Fiche Auto-Évaluation'} — ${opts.employeeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f4f0; color: #463738; padding: 32px; }
    .page { background: white; max-width: 960px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.12); }
    .header { background: #463738; color: white; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left h1 { font-size: 22px; font-weight: 900; color: #F26322; letter-spacing: 1px; text-transform: uppercase; }
    .header-left p { font-size: 13px; color: #d4cec8; margin-top: 4px; }
    .header-right { text-align: right; font-size: 12px; color: #d4cec8; }
    .header-right .campaign { font-size: 14px; font-weight: 700; color: #9A9750; }
    .section-bar { background: #F26322; color: white; padding: 10px 36px; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    .employee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-bottom: 2px solid #F26322; }
    .employee-field { padding: 14px 20px; border-right: 1px solid #eee; }
    .employee-field:last-child { border-right: none; }
    .employee-field label { font-size: 10px; font-weight: 900; color: #A39D98; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
    .employee-field span { font-size: 14px; font-weight: 700; color: #463738; }
    .table-wrap { padding: 24px 36px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    tr:hover td { background: #fafaf8; }
    .summary { background: #f8f7f4; border-top: 2px solid #E3E1DB; padding: 20px 36px; display: flex; justify-content: space-between; align-items: center; }
    .summary .avg { font-size: 28px; font-weight: 900; color: #F26322; }
    .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 20px 36px; border-top: 1px solid #eee; }
    .sig-box { border: 1px solid #ddd; border-radius: 6px; padding: 14px 16px; min-height: 80px; }
    .sig-box label { font-size: 10px; font-weight: 900; color: #A39D98; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
    .footer { background: #463738; color: #d4cec8; padding: 12px 36px; font-size: 11px; display: flex; justify-content: space-between; }
    .footer strong { color: #F26322; }
    @media print {
      body { padding: 0; background: white; }
      .page { box-shadow: none; border-radius: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <h1>Corica Mining Services</h1>
        <p>Talent Quantum v8.0 — ${mode === 'objectives' ? 'Fiche d\'Objectifs de Performance' : 'Fiche d\'Auto-Évaluation'}</p>
      </div>
      <div class="header-right">
        <div class="campaign">${campaign}</div>
        <div style="margin-top:6px;">Imprimé le ${date}</div>
        <div style="margin-top:4px;">ID : ${opts.employeeId}</div>
      </div>
    </div>

    <div class="section-bar">Informations Collaborateur</div>
    <div class="employee-grid">
      <div class="employee-field"><label>Nom & Prénoms</label><span>${opts.employeeName}</span></div>
      <div class="employee-field"><label>Fonction</label><span>${opts.fonction}</span></div>
      <div class="employee-field"><label>Département</label><span>${opts.departement}</span></div>
      <div class="employee-field"><label>Site</label><span>${opts.site}</span></div>
      <div class="employee-field"><label>Pays</label><span>${opts.pays}</span></div>
      <div class="employee-field"><label>Évaluateur N+1</label><span>${opts.managerN1Name ?? '—'}</span></div>
    </div>

    <div class="section-bar">${mode === 'objectives' ? 'Objectifs de Performance' : 'Auto-Évaluation des Objectifs'}</div>
    <div class="table-wrap">
      <table>
        <thead>${tableHeaders}</thead>
        <tbody>${kpisRows || `<tr><td colspan="5" style="text-align:center; padding:20px; color:#A39D98;">Aucun objectif soumis.</td></tr>`}</tbody>
      </table>
    </div>

    ${mode === 'evaluation' ? `
    <div class="summary">
      <div>
        <div style="font-size:11px; font-weight:900; color:#A39D98; text-transform:uppercase; letter-spacing:1px;">Note moyenne auto-évaluation</div>
        <div class="avg">${avgScore} / 4</div>
      </div>
      <div style="font-size:12px; color:#A39D98;">
        ${scores.length} objectif(s) évalué(s) sur ${opts.kpis.length}
      </div>
    </div>` : ''}

    <div class="signature-row">
      <div class="sig-box">
        <label>Signature du Collaborateur</label>
        <div style="margin-top:24px; border-top:1px solid #ccc; padding-top:8px; font-size:12px; color:#A39D98;">${opts.employeeName} — Date :</div>
      </div>
      <div class="sig-box">
        <label>Signature du Manager N+1</label>
        <div style="margin-top:24px; border-top:1px solid #ccc; padding-top:8px; font-size:12px; color:#A39D98;">${opts.managerN1Name ?? '—'} — Date :</div>
      </div>
    </div>

    <div class="footer">
      <span>Document confidentiel · <strong>CORICA Talent Quantum</strong></span>
      <span>Généré le ${date} · ${campaign}</span>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => { window.print(); }, 400 );</script>
</body>
</html>`;

  w.document.write(html);
  w.document.close();
}
