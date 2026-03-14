"use client";

import React, { useState } from 'react';
import {
    Home, ChevronRight, Building2, UserPlus, Users, Edit3,
    CheckCircle, Printer, Mail, X, User, LayoutDashboard,
    Save, AlertCircle, Bell
} from 'lucide-react';
import { useUser, ALL_USERS, CoricaUser, findUserById } from '@/context/UserContext';
import { sendWelcomeEmail, sendAdminNotifEmail } from '@/lib/emailUtils';

// ─── Types ───────────────────────────────────────────────────────────────────
type SiteMgmtView = 'MENU' | 'CREATE' | 'EDIT_SELECT' | 'EDIT_FORM';

interface EmployeeFormData {
    nom_prenoms: string;
    date_naissance: string;
    telephone: string;
    usercount: string;
    fonction: string;
    date_embauche: string;
    departement: string;
    scope: string;
    pays: string;
    id_evaluateur: number | null;
    id_evaluateur_n2: number | null;
    // Champs texte libres N+1 (mode création)
    n1_nom: string;
    n1_email: string;
    n1_departement: string;
    n1_fonction: string;
    // Champs texte libres N+2 (mode création)
    n2_nom: string;
    n2_email: string;
    n2_fonction: string;
}

const EMPTY_FORM: EmployeeFormData = {
    nom_prenoms: '', date_naissance: '', telephone: '', usercount: '',
    fonction: '', date_embauche: '', departement: '', scope: '', pays: '',
    id_evaluateur: null, id_evaluateur_n2: null,
    n1_nom: '', n1_email: '', n1_departement: '', n1_fonction: '',
    n2_nom: '', n2_email: '', n2_fonction: '',
};

// ─── Phase de construction : boîte email de test ─────────────────────────────
const DEV_EMAIL = 'ibdjibo@gmail.com';
const IS_DEV_MODE = true; // Passer à false en production

// ─── Notification Recipients après modification ───────────────────────────────
function buildNotificationList(emp: CoricaUser, currentUser: CoricaUser): string[] {
    const list: string[] = [];

    // Coordinateur Pays
    const coordinateurs = ALL_USERS.filter(u =>
        u.interface_utilisateur === 'coordinateur' && (u.pays === emp.pays || u.pays === 'Tous les pays')
    );
    coordinateurs.forEach(c =>
        list.push(`${c.nom_prenoms} — Coordinateur Pays → ${IS_DEV_MODE ? DEV_EMAIL : c.usercount}`)
    );

    // N+1
    const n1 = findUserById(emp.id_evaluateur);
    if (n1) list.push(`${n1.nom_prenoms} — Évaluateur N+1 → ${IS_DEV_MODE ? DEV_EMAIL : n1.usercount}`);

    // N+2
    const n2 = findUserById(emp.id_evaluateur_n2);
    if (n2) list.push(`${n2.nom_prenoms} — Évaluateur N+2 → ${IS_DEV_MODE ? DEV_EMAIL : n2.usercount}`);

    // GROUP HR MANAGER RECRUITMENT (Admin Niv.3 — 10087)
    const grpHr = findUserById(10087);
    if (grpHr) list.push(`${grpHr.nom_prenoms} — Admin Niv.3 → ${IS_DEV_MODE ? DEV_EMAIL : grpHr.usercount}`);

    // Super Admin (12410)
    const superAdmin = findUserById(12410);
    if (superAdmin) list.push(`${superAdmin.nom_prenoms} — Super Administrateur → ${IS_DEV_MODE ? DEV_EMAIL : superAdmin.usercount}`);

    return [...new Set(list)];
}


// ─── Champ de formulaire ──────────────────────────────────────────────────────
function Field({ label, value, onChange, readOnly, placeholder }: {
    label: string; value: string; onChange?: (v: string) => void;
    readOnly?: boolean; placeholder?: string;
}) {
    return (
        <div>
            <label className="text-[12px] font-bold text-[#A39D98] mb-1.5 block uppercase">{label}</label>
            <input
                readOnly={readOnly}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-md px-4 py-2.5 text-[#463738] font-medium text-[14px] outline-none border-none ${readOnly ? 'bg-[#E3E1DB]/70 cursor-not-allowed' : 'bg-[#f6f6f6] focus:ring-1 focus:ring-[#F26322]'} transition-all`}
            />
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function SiteManagementView({ onBack }: { onBack: () => void }) {
    const { currentUser, managerN2 } = useUser();
    const [subView, setSubView] = useState<SiteMgmtView>('MENU');
    const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showWelcomeEmailModal, setShowWelcomeEmailModal] = useState(false);
    const [notifList, setNotifList] = useState<string[]>([]);
    const [savedEmployee, setSavedEmployee] = useState<CoricaUser | null>(null);
    const [createdUsercount, setCreatedUsercount] = useState('');
    const [defaultPassword] = useState('COR-123');

    // ─── Fonction d'impression dédiée ────────────────────────────────────────
    const printEmployeeForm = () => {
        const isCreation = selectedId === null;

        // En mode création : utiliser les champs texte saisis librement
        // En mode modification : résoudre depuis les IDs
        const n1Nom = isCreation ? form.n1_nom : (findUserById(form.id_evaluateur)?.nom_prenoms ?? '—');
        const n1Email = isCreation ? form.n1_email : (findUserById(form.id_evaluateur)?.usercount ?? '—');
        const n1Dept = isCreation ? form.n1_departement : (findUserById(form.id_evaluateur)?.departement ?? '—');
        const n1Fonc = isCreation ? form.n1_fonction : (findUserById(form.id_evaluateur)?.fonction ?? '—');

        const n2Nom = isCreation ? form.n2_nom : (findUserById(form.id_evaluateur_n2)?.nom_prenoms ?? managerN2?.nom_prenoms ?? '—');
        const n2Email = isCreation ? form.n2_email : (findUserById(form.id_evaluateur_n2)?.usercount ?? managerN2?.usercount ?? '—');
        const n2Fonc = isCreation ? form.n2_fonction : (findUserById(form.id_evaluateur_n2)?.fonction ?? managerN2?.fonction ?? '—');

        const dateNow = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Formulaire Employ\u00e9 — ${form.nom_prenoms}</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d2d2d; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #F26322; padding-bottom: 12px; margin-bottom: 20px; }
    .header .logo { font-size: 20px; font-weight: 900; color: #463738; }
    .header .logo span { color: #F26322; }
    .header .date { font-size: 11px; color: #888; }
    .title { font-size: 16px; font-weight: 900; color: #463738; text-align: center; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
    .section { margin-bottom: 18px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .section-title { background: #463738; color: white; font-weight: 700; font-size: 12px; padding: 8px 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-title.orange { background: #F26322; }
    .section-title.olive { background: #9A9750; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .field { padding: 8px 14px; border-bottom: 1px solid #f0f0f0; }
    .field:nth-child(odd) { border-right: 1px solid #f0f0f0; }
    .field-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 3px; }
    .field-value { font-size: 13px; font-weight: 600; color: #2d2d2d; min-height: 18px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    .full-width { grid-column: 1 / -1; }
    .footer { margin-top: 30px; border-top: 2px solid #463738; padding-top: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
    .signature-zone { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .sig-box { border: 1px solid #ccc; border-radius: 6px; padding: 10px; text-align: center; }
    .sig-label { font-size: 10px; font-weight: 700; color: #463738; text-transform: uppercase; margin-bottom: 4px; }
    .sig-name { font-size: 11px; color: #555; margin-bottom: 24px; }
    .sig-line { border-top: 1px solid #ccc; font-size: 10px; color: #aaa; padding-top: 4px; }
    .badge { display: inline-block; background: #F26322; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CORICA <span>QUANTUM</span> <span style="font-size:11px;color:#9A9750;">RH &amp; 9-BOX</span></div>
    <div class="date">Imprim\u00e9 le : ${dateNow} &nbsp;|&nbsp; Administrateur : ${currentUser?.nom_prenoms ?? ''}</div>
  </div>

  <div class="title">Formulaire Employ\u00e9 — Fiche de Profil</div>

  <!-- Informations Personnelles -->
  <div class="section">
    <div class="section-title orange">&#128100; Informations Personnelles</div>
    <div class="grid">
      <div class="field"><div class="field-label">Matricule (Id_Usercount)</div><div class="field-value">${selectedId ?? 'Auto-g\u00e9n\u00e9r\u00e9'}</div></div>
      <div class="field"><div class="field-label">Nom et Pr\u00e9noms</div><div class="field-value">${form.nom_prenoms || '—'}</div></div>
      <div class="field"><div class="field-label">Date de Naissance</div><div class="field-value">${form.date_naissance || '—'}</div></div>
      <div class="field"><div class="field-label">Usercount (Email)</div><div class="field-value">${form.usercount || createdUsercount || '—'}</div></div>
      <div class="field full-width"><div class="field-label">Num\u00e9ro de T\u00e9l\u00e9phone</div><div class="field-value">${form.telephone || '—'}</div></div>
    </div>
  </div>

  <!-- Informations Professionnelles -->
  <div class="section">
    <div class="section-title olive">&#128188; Informations Professionnelles</div>
    <div class="grid">
      <div class="field"><div class="field-label">Fonction / Poste Occup\u00e9</div><div class="field-value">${form.fonction || '—'}</div></div>
      <div class="field"><div class="field-label">Date d'Embauche</div><div class="field-value">${form.date_embauche || '—'}</div></div>
      <div class="field"><div class="field-label">D\u00e9partement</div><div class="field-value">${form.departement || '—'}</div></div>
      <div class="field"><div class="field-label">Site / Scope d'Affectation</div><div class="field-value">${form.scope || siteScope}</div></div>
      <div class="field"><div class="field-label">Pays d'Affectation</div><div class="field-value">${form.pays || currentUser?.pays || '—'}</div></div>
      <div class="field"><div class="field-label">R\u00e9f\u00e9rence Syst\u00e8me</div><div class="field-value"><span class="badge">Phase de construction</span></div></div>
    </div>
  </div>

  <!-- Manager Direct N+1 -->
  <div class="section">
    <div class="section-title">&#9650; Manager Direct — \u00c9valuateur N+1</div>
    <div class="grid">
      <div class="field"><div class="field-label">Nom et Pr\u00e9noms N+1</div><div class="field-value">${n1Nom || '—'}</div></div>
      <div class="field"><div class="field-label">Usercount (Email) N+1</div><div class="field-value">${n1Email || '—'}</div></div>
      <div class="field"><div class="field-label">D\u00e9partement N+1</div><div class="field-value">${n1Dept || '—'}</div></div>
      <div class="field"><div class="field-label">Fonction N+1</div><div class="field-value">${n1Fonc || '—'}</div></div>
    </div>
  </div>

  <!-- Manager N+2 -->
  <div class="section">
    <div class="section-title">&#9650;&#9650; Manager N+2 — \u00c9valuateur N+2 (Calibration)</div>
    <div class="grid">
      <div class="field"><div class="field-label">Nom et Pr\u00e9noms N+2</div><div class="field-value">${n2Nom || '—'}</div></div>
      <div class="field"><div class="field-label">Email N+2</div><div class="field-value">${n2Email || '—'}</div></div>
      <div class="field full-width"><div class="field-label">Fonction N+2</div><div class="field-value">${n2Fonc || '—'}</div></div>
    </div>
  </div>

  <!-- Zones de signature -->
  <div class="signature-zone">
    <div class="sig-box">
      <div class="sig-label">Signature Employ\u00e9</div>
      <div class="sig-name">${form.nom_prenoms || '—'}</div>
      <div class="sig-line">Date &amp; Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Signature \u00c9valuateur N+1</div>
      <div class="sig-name">${n1Nom || '—'}</div>
      <div class="sig-line">Date &amp; Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Visa Admin Site</div>
      <div class="sig-name">${currentUser?.nom_prenoms ?? '—'}</div>
      <div class="sig-line">Date &amp; Tampon</div>
    </div>
  </div>

  <div class="footer">
    <span>CORICA MINING SERVICES — Syst\u00e8me RH &amp; 9-Box Talent Management</span>
    <span>Document confidentiel — Usage interne uniquement</span>
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        if (win) {
            win.document.write(html);
            win.document.close();
        }
    };




    const siteScope = currentUser?.scope ?? '';
    const nomAdmin = currentUser?.nom_prenoms ?? 'Administrateur Site';

    // Employés du scope de l'admin
    const scopeEmployees = ALL_USERS.filter(u => u.scope === siteScope && u.id_usercount !== currentUser?.id_usercount);

    // N+1 de l'admin = currentUser lui-même (il est l'évaluateur N+1 des ses directs)
    const n1Name = currentUser?.nom_prenoms ?? '';
    const n1Email = currentUser?.usercount ?? '';
    const n2Name = managerN2?.nom_prenoms ?? '—';
    const n2Email = managerN2?.usercount ?? '—';

    // Changer de champ dans le formulaire
    const setF = (key: keyof EmployeeFormData) => (v: string) =>
        setForm(prev => ({ ...prev, [key]: v }));

    // Charger employé sélectionné dans le formulaire de modification
    const loadEmployee = (id: number) => {
        const emp = ALL_USERS.find(u => u.id_usercount === id);
        if (!emp) return;
        setSelectedId(id);
        const n1 = findUserById(emp.id_evaluateur);
        const n2 = findUserById(emp.id_evaluateur_n2);
        setForm({
            nom_prenoms: emp.nom_prenoms,
            date_naissance: 'Non définie',
            telephone: '+225 __________',
            usercount: emp.usercount,
            fonction: emp.fonction,
            date_embauche: 'Non définie',
            departement: emp.departement,
            scope: emp.scope,
            pays: emp.pays,
            id_evaluateur: emp.id_evaluateur ?? null,
            id_evaluateur_n2: emp.id_evaluateur_n2 ?? null,
            n1_nom: '', n1_email: '', n1_departement: '', n1_fonction: '',
            n2_nom: '', n2_email: '', n2_fonction: '',
        });
        setSubView('EDIT_FORM');
    };

    // Sauvegarder modification
    const handleSaveModification = async () => {
        const emp = ALL_USERS.find(u => u.id_usercount === selectedId);
        if (!emp || !currentUser) return;
        const recipients = buildNotificationList(emp, currentUser);
        setNotifList(recipients);
        setSavedEmployee(emp);

        // ═══ Envoi d'email réel de notification ═══
        try {
            await sendAdminNotifEmail({
                employeeName: emp.nom_prenoms,
                action: 'modification',
                adminName: nomAdmin,
                recipients,
            });
        } catch (err) {
            console.warn('[Email] Erreur envoi (non bloquant):', err);
        }

        setShowNotifModal(true);
    };

    // Sauvegarder création
    const handleSaveCreation = async () => {
        // Générer un usercount automatique si non saisi
        const newId = 12500 + Math.floor(Math.random() * 900);
        const uc = form.usercount || `Employe.${newId}@company.com`;
        setCreatedUsercount(uc);

        // ═══ Envoi des emails réels ═══
        const loginUrl = `${window.location.origin}/login?usercount=${encodeURIComponent(uc)}&firstLogin=true`;
        try {
            // 1. Email de bienvenue au nouvel employé + copie dev
            await sendWelcomeEmail({
                employeeName: form.nom_prenoms,
                usercount: uc,
                defaultPassword: defaultPassword,
                adminName: nomAdmin,
                loginUrl,
            });
            // 2. Notification aux admins
            await sendAdminNotifEmail({
                employeeName: form.nom_prenoms,
                action: 'création',
                adminName: nomAdmin,
                recipients: [],
            });
        } catch (err) {
            console.warn('[Email] Erreur envoi (non bloquant):', err);
        }

        setShowWelcomeEmailModal(true);
    };

    // ─── Rendu formulaire identique à Mon Profil ──────────────────────────
    const renderProfileForm = (title: string, isEdit: boolean) => {
        const n1Resolved = isEdit ? (findUserById(form.id_evaluateur) ?? null) : null;
        return (
            <div className="space-y-5">
                {/* Card : Informations Personnelles */}
                <div className="bg-white rounded-xl border-[1.5px] border-[#F26322] p-6 shadow-sm">
                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                        <User size={18} className="text-[#F26322]" /> Informations Personnelles de l'Employé
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <Field label="Matricule (Auto-généré)" value={isEdit ? `${selectedId}` : 'Auto-généré'} readOnly />
                        <Field label="Nom et Prénoms" value={form.nom_prenoms} onChange={setF('nom_prenoms')} placeholder="Prénom Nom" />
                        <Field label="Date de Naissance" value={form.date_naissance} onChange={setF('date_naissance')} placeholder="JJ/MM/AAAA" />
                        <Field label="Usercount (Email)" value={form.usercount} onChange={setF('usercount')} placeholder="Employe.XXXXX@company.com" />
                        <Field label="Numéro de Téléphone" value={form.telephone} onChange={setF('telephone')} placeholder="+Indicatif Numéro" />
                    </div>
                </div>

                {/* Card : Informations Professionnelles */}
                <div className="bg-white rounded-xl border border-[#9A9750] p-6 shadow-sm">
                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                        <LayoutDashboard size={18} className="text-[#9A9750]" /> Informations Professionnelles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <Field label="Fonction / Poste Occupé" value={form.fonction} onChange={setF('fonction')} placeholder="Ex: EMPLOYE" />
                        <Field label="Date d'Embauche" value={form.date_embauche} onChange={setF('date_embauche')} placeholder="JJ/MM/AAAA" />
                        <Field label="Département" value={form.departement} onChange={setF('departement')} placeholder="Ex: PRODUCTION" />
                        <Field label="Service / Scope d'Affectation" value={form.scope || siteScope} readOnly />
                        <Field label="Site ou Bureau d'Affectation" value={form.scope || siteScope} readOnly />
                        <Field label="Pays d'Affectation" value={form.pays || currentUser?.pays || ''} readOnly />
                    </div>
                </div>

                {/* Card : Manager Direct (N+1) */}
                <div className="bg-white rounded-xl border border-[#463738] p-6 shadow-sm">
                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                        <User size={18} className="text-[#463738]" /> Manager Direct (Évaluateur N+1)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {isEdit ? (
                            <>
                                <Field label="Nom et Prénoms" value={findUserById(form.id_evaluateur)?.nom_prenoms ?? ''} readOnly />
                                <Field label="Usercount (Email)" value={findUserById(form.id_evaluateur)?.usercount ?? ''} readOnly />
                                <Field label="Département" value={findUserById(form.id_evaluateur)?.departement ?? ''} readOnly />
                                <Field label="Fonction / Poste Occupé" value={findUserById(form.id_evaluateur)?.fonction ?? ''} readOnly />
                            </>
                        ) : (
                            <>
                                <Field label="Nom et Prénoms" value={form.n1_nom} onChange={setF('n1_nom')} placeholder="Nom et Prénoms du Manager N+1" />
                                <Field label="Usercount (Email)" value={form.n1_email} onChange={setF('n1_email')} placeholder="Employe.XXXXX@company.com" />
                                <Field label="Département" value={form.n1_departement} onChange={setF('n1_departement')} placeholder="Ex: PRODUCTION" />
                                <Field label="Fonction / Poste Occupé" value={form.n1_fonction} onChange={setF('n1_fonction')} placeholder="Ex: RESPONSABLE SECTEUR" />
                            </>
                        )}
                    </div>
                </div>

                {/* Card : Manager N+2 */}
                <div className="bg-white rounded-xl border border-[#463738]/50 p-6 shadow-sm">
                    <h4 className="font-bold text-[#463738] text-[15px] mb-5 flex items-center gap-2">
                        <User size={18} className="text-[#463738]/70" /> Manager N+2 — Évaluateur N+2 (Calibration)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {isEdit ? (
                            <>
                                <Field label="Nom et Prénoms" value={findUserById(form.id_evaluateur_n2)?.nom_prenoms ?? n2Name} readOnly />
                                <Field label="Email" value={findUserById(form.id_evaluateur_n2)?.usercount ?? n2Email} readOnly />
                                <div className="md:col-span-2">
                                    <Field label="Fonction / Poste Occupé" value={findUserById(form.id_evaluateur_n2)?.fonction ?? managerN2?.fonction ?? ''} readOnly />
                                </div>
                            </>
                        ) : (
                            <>
                                <Field label="Nom et Prénoms" value={form.n2_nom} onChange={setF('n2_nom')} placeholder="Nom et Prénoms du Manager N+2" />
                                <Field label="Email" value={form.n2_email} onChange={setF('n2_email')} placeholder="Employe.XXXXX@company.com" />
                                <div className="md:col-span-2">
                                    <Field label="Fonction / Poste Occupé" value={form.n2_fonction} onChange={setF('n2_fonction')} placeholder="Ex: DIRECTEUR REGIONAL" />
                                </div>
                            </>
                        )}
                    </div>
                </div>



                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={isEdit ? handleSaveModification : handleSaveCreation}
                        className="px-6 py-3 bg-[#F26322] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md flex items-center gap-2"
                    >
                        <Save size={16} /> {isEdit ? 'Enregistrer les Modifications' : 'Créer le Collaborateur'}
                    </button>
                    <button
                        onClick={() => { setSubView(isEdit ? 'EDIT_SELECT' : 'MENU'); setForm(EMPTY_FORM); }}
                        className="px-6 py-3 border border-[#A39D98]/40 text-[#A39D98] rounded-xl font-bold text-sm hover:bg-[#E3E1DB] transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        );
    };

    // ─── Header breadcrumb commun ──────────────────────────────────────────
    const Breadcrumb = ({ last }: { last: string }) => (
        <div className="flex items-center gap-2 text-[12px] font-bold text-[#A39D98] mb-5">
            <span className="hover:text-[#F26322] cursor-pointer flex items-center gap-1 transition-colors" onClick={onBack}>
                <Home size={14} /> 🏠 Page d'accueil Site Admin
            </span>
            <ChevronRight size={14} />
            <span className="hover:text-[#F26322] cursor-pointer transition-colors" onClick={() => { setSubView('MENU'); setForm(EMPTY_FORM); }}>Gestion du Site</span>
            {last && <><ChevronRight size={14} /><span className="text-[#463738]">{last}</span></>}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* ── MENU ───────────────────────────────────────────────────── */}
            {subView === 'MENU' && (
                <>
                    <Breadcrumb last="" />
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-[24px] font-black text-[#463738] flex items-center gap-2">
                                <Building2 size={24} className="text-[#F26322]" /> Gestion du Site — {siteScope}
                            </h2>
                            <p className="text-[#A39D98] text-sm mt-1">Bienvenue, <strong>{nomAdmin}</strong>. Gérez les employés rattachés à votre périmètre.</p>
                        </div>
                    </div>

                    {/* KPI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        {[
                            { label: 'Employés du site', value: scopeEmployees.length },
                            { label: 'Évaluateurs N+1', value: scopeEmployees.filter(u => u.interface_utilisateur === 'evaluateur').length },
                            { label: 'Collaborateurs', value: scopeEmployees.filter(u => u.interface_utilisateur === 'employe').length },
                        ].map((k, i) => (
                            <div key={i} className="bg-[#463738] text-white rounded-xl p-5 shadow">
                                <p className="text-xs font-bold text-white/60 uppercase mb-1">{k.label}</p>
                                <p className="text-3xl font-black">{k.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Deux boutons principaux */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => { setForm({ ...EMPTY_FORM, scope: siteScope, pays: currentUser?.pays ?? '', id_evaluateur: currentUser?.id_usercount ?? null, id_evaluateur_n2: currentUser?.id_evaluateur_n2 ?? null }); setSubView('CREATE'); }}
                            className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl font-bold text-white text-[16px] shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg,#F26322 0%,#463738 100%)' }}
                        >
                            <UserPlus size={32} />
                            Créer un Employé
                            <span className="text-xs font-normal opacity-70">Formulaire de création identique au profil employé</span>
                        </button>
                        <button
                            onClick={() => setSubView('EDIT_SELECT')}
                            className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl font-bold text-white text-[16px] shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg,#9A9750 0%,#463738 100%)' }}
                        >
                            <Edit3 size={32} />
                            Modifier le formulaire d'un Employé
                            <span className="text-xs font-normal opacity-70">Sélectionnez l'employé puis effectuez les modifications</span>
                        </button>
                    </div>
                </>
            )}

            {/* ── CRÉER UN EMPLOYÉ ───────────────────────────────────────── */}
            {subView === 'CREATE' && (
                <>
                    <Breadcrumb last="Créer le formulaire d'un Employé" />
                    <div className="mb-4">
                        <h2 className="text-[22px] font-black text-[#463738] flex items-center gap-2">
                            <UserPlus size={22} className="text-[#F26322]" /> Créer le formulaire d'un Employé
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">Site : <strong>{siteScope}</strong> · N+1 auto-assigné : <strong>{n1Name}</strong></p>
                    </div>
                    {renderProfileForm('Créer le formulaire d\'un Employé', false)}
                </>
            )}

            {/* ── SÉLECTION EMPLOYÉ À MODIFIER ──────────────────────────── */}
            {subView === 'EDIT_SELECT' && (
                <>
                    <Breadcrumb last="Modifier le formulaire d'un Employé" />
                    <div className="mb-4">
                        <h2 className="text-[22px] font-black text-[#463738] flex items-center gap-2">
                            <Edit3 size={22} className="text-[#9A9750]" /> Modifier le formulaire d'un Employé
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">Sélectionnez l'employé dans la liste déroulante, puis procédez aux modifications.</p>
                    </div>

                    {/* Dropdown */}
                    <div className="bg-white rounded-xl border border-[#9A9750]/40 p-5 shadow-sm mb-4">
                        <label className="text-xs font-bold text-[#A39D98] uppercase block mb-2">Sélectionner un employé par Id_Usercount</label>
                        <select
                            className="w-full bg-[#f6f6f6] border border-[#A39D98]/30 rounded-xl px-4 py-3 text-[#463738] font-medium text-sm outline-none focus:ring-2 focus:ring-[#9A9750]/30"
                            defaultValue=""
                            onChange={e => { if (e.target.value) loadEmployee(Number(e.target.value)); }}
                        >
                            <option value="" disabled>-- Choisir un employé (Id_Usercount) --</option>
                            {scopeEmployees.map(emp => (
                                <option key={emp.id_usercount} value={emp.id_usercount}>
                                    {emp.id_usercount} — {emp.nom_prenoms}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tableau récapitulatif */}
                    <div className="bg-white rounded-xl border border-[#A39D98]/30 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-[#A39D98]/20 bg-[#E3E1DB]/30">
                            <h3 className="font-bold text-[#463738] text-sm flex items-center gap-2">
                                <Users size={16} /> Tous les employés du site {siteScope} ({scopeEmployees.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#E3E1DB]/60 text-[#A39D98]">
                                    <tr>
                                        {['Id', 'Nom et Prénoms', 'Poste', 'Département', 'Éval. N+1', 'Éval. N+2', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 font-bold text-xs uppercase whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3E1DB]">
                                    {scopeEmployees.map(emp => {
                                        const en1 = findUserById(emp.id_evaluateur);
                                        const en2 = findUserById(emp.id_evaluateur_n2);
                                        return (
                                            <tr key={emp.id_usercount} className="hover:bg-[#E3E1DB]/30 transition-colors">
                                                <td className="px-4 py-3 font-bold text-[#F26322]">{emp.id_usercount}</td>
                                                <td className="px-4 py-3 font-semibold text-[#463738] whitespace-nowrap">{emp.nom_prenoms}</td>
                                                <td className="px-4 py-3 text-[#A39D98] text-xs">{emp.fonction}</td>
                                                <td className="px-4 py-3 text-[#A39D98] text-xs">{emp.departement}</td>
                                                <td className="px-4 py-3 text-xs text-[#463738]">{en1?.nom_prenoms ?? '—'}</td>
                                                <td className="px-4 py-3 text-xs text-[#463738]">{en2?.nom_prenoms ?? 'Djibo Ibouraima'}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => loadEmployee(emp.id_usercount)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#9A9750] text-white rounded-lg text-xs font-bold hover:bg-[#858245] transition-colors"
                                                    >
                                                        <Edit3 size={12} /> Modifier
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ── FORMULAIRE DE MODIFICATION ─────────────────────────────── */}
            {subView === 'EDIT_FORM' && selectedId && (
                <>
                    <Breadcrumb last="Modifier le formulaire d'un Employé" />
                    <div className="mb-4">
                        <h2 className="text-[22px] font-black text-[#463738] flex items-center gap-2">
                            <Edit3 size={22} className="text-[#9A9750]" /> Modifier le formulaire d'un Employé
                        </h2>
                        <p className="text-[#A39D98] text-sm mt-1">
                            Employé sélectionné : <strong className="text-[#F26322]">#{selectedId}</strong> — {form.nom_prenoms}
                        </p>
                    </div>
                    {renderProfileForm('Modifier le formulaire d\'un Employé', true)}
                </>
            )}

            {/* ── MODAL : EMAIL DE BIENVENUE (nouveau employé) ───────────── */}
            {showWelcomeEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-emerald-300 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-[#463738] text-[18px] flex items-center gap-2">
                                <CheckCircle size={22} className="text-emerald-500" /> Employé créé avec succès
                            </h3>
                            <button onClick={() => { setShowWelcomeEmailModal(false); setShowPrintModal(true); }} className="text-[#A39D98] hover:text-[#463738]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Email simulé */}
                        <div className="bg-[#f6f6f6] border border-[#A39D98]/30 rounded-xl p-4 mb-4 font-mono text-xs">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#A39D98]/20">
                                <Mail size={14} className="text-[#F26322]" />
                                <span className="font-bold text-[#463738]">Email de notification envoyé automatiquement</span>
                            </div>
                            <p className="text-[#A39D98] mb-1"><strong>De :</strong> corica.quantum@company.com</p>
                            <p className="text-[#A39D98] mb-1"><strong>À :</strong> {createdUsercount}</p>
                            <p className="text-[#A39D98] mb-3"><strong>Objet :</strong> Bienvenue sur Corica Talent Quantum — Vos identifiants d'accès</p>
                            <div className="bg-white rounded-lg p-3 border border-[#E3E1DB] space-y-2 text-[11px]">
                                <p className="text-[#463738]">Bonjour <strong>{form.nom_prenoms}</strong>,</p>
                                <p className="text-[#A39D98]">Votre compte a été créé par <strong>{nomAdmin}</strong> sur la plateforme Corica Talent Quantum.</p>
                                <div className="bg-[#F26322]/5 border border-[#F26322]/20 rounded-lg p-3 space-y-1.5">
                                    <p className="font-bold text-[#463738]">🔑 Vos identifiants de connexion :</p>
                                    <p><span className="text-[#A39D98]">Usercount :</span> <strong className="text-[#F26322]">{createdUsercount}</strong></p>
                                    <p><span className="text-[#A39D98]">Mot de passe par défaut :</span> <strong className="text-[#F26322]">{defaultPassword}</strong></p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                    <p className="font-bold text-emerald-800 mb-1">🔗 Lien d'accès à votre profil :</p>
                                    <a
                                        href={`/login?usercount=${encodeURIComponent(createdUsercount)}&firstLogin=true`}
                                        className="text-[#F26322] underline break-all hover:text-orange-700 transition-colors"
                                        target="_blank"
                                    >
                                        {typeof window !== 'undefined' ? window.location.origin : ''}/login?usercount={encodeURIComponent(createdUsercount)}&amp;firstLogin=true
                                    </a>
                                </div>
                                <p className="text-[#A39D98] italic text-[10px]">⚠️ Veuillez modifier votre mot de passe après votre première connexion.</p>
                            </div>
                        </div>

                        <p className="text-xs text-[#A39D98] mb-4 flex items-center gap-1">
                            <AlertCircle size={13} /> Cet email a été envoyé depuis corica.quantum@company.com
                        </p>
                        <button
                            onClick={() => { setShowWelcomeEmailModal(false); setShowPrintModal(true); }}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Continuer → Impression du formulaire
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODAL : NOTIFICATIONS EMAIL ───────────────────────────── */}

            {showNotifModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-[#F26322]/30 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-[#463738] text-[18px] flex items-center gap-2">
                                <CheckCircle size={22} className="text-emerald-500" /> Modifications enregistrées
                            </h3>
                            <button onClick={() => { setShowNotifModal(false); setShowPrintModal(true); }} className="text-[#A39D98] hover:text-[#463738]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                                <Bell size={16} /> Notifications email envoyées automatiquement à :
                            </p>
                            <ul className="space-y-1.5">
                                {notifList.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                                        <Mail size={13} className="mt-0.5 shrink-0 text-amber-500" />
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="text-xs text-[#A39D98] mb-4 flex items-center gap-1">
                            <AlertCircle size={13} /> Toute modification est auditée et tracée dans le système.
                        </p>

                        <button
                            onClick={() => { setShowNotifModal(false); setShowPrintModal(true); }}
                            className="w-full py-3 bg-[#F26322] text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Continuer → Impression
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODAL : IMPRESSION ────────────────────────────────────── */}
            {showPrintModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#463738]/20 animate-in fade-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#463738] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Printer size={30} className="text-white" />
                            </div>
                            <h3 className="font-black text-[#463738] text-[18px] mb-2">Impression du formulaire</h3>
                            <p className="text-sm text-[#A39D98] mb-6">
                                Souhaitez-vous imprimer le formulaire de l'employé <strong className="text-[#463738]">{form.nom_prenoms || `#${selectedId}`}</strong> ?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowPrintModal(false); printEmployeeForm(); }}
                                    className="flex-1 py-3 bg-[#F26322] text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Printer size={16} /> Oui, imprimer
                                </button>
                                <button
                                    onClick={() => { setShowPrintModal(false); setSubView('MENU'); setForm(EMPTY_FORM); setSavedEmployee(null); }}
                                    className="flex-1 py-3 border border-[#A39D98]/40 text-[#A39D98] rounded-xl font-bold hover:bg-[#E3E1DB] transition-colors"
                                >
                                    Non, terminer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
