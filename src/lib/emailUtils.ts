// ─── Utilitaire d'envoi d'email via l'API Next.js ──────────────────────────────
// Utilisé par SiteManagementView pour notifier lors de création/modification d'employé

export interface WelcomeEmailData {
    employeeName: string;
    usercount: string;
    defaultPassword: string;
    adminName: string;
    loginUrl: string;
}

export interface NotifEmailData {
    employeeName: string;
    action: 'création' | 'modification';
    adminName: string;
    recipients: string[];  // noms affichés dans le modal
}

// Adresses email fixes de notification (phase de construction)
const DEV_RECIPIENTS = [
    'ibdjibo@gmail.com',
    'ibouraima.djibo@corica.com',
];

// ─── Email de bienvenue au nouvel employé ────────────────────────────────────
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
            <div style="background:#463738;padding:24px 32px;display:flex;align-items:center;gap:12px;">
                <span style="font-size:22px;font-weight:900;color:#fff;">CORICA <span style="color:#F26322;">QUANTUM</span></span>
                <span style="font-size:12px;color:#9A9750;font-weight:700;">RH & 9-BOX</span>
            </div>
            <div style="padding:32px;">
                <h2 style="color:#463738;margin-top:0;">Bienvenue sur Corica Talent Quantum, ${data.employeeName} !</h2>
                <p style="color:#555;line-height:1.6;">
                    Votre compte professionnel a été créé par <strong>${data.adminName}</strong>.
                    Vous pouvez dès maintenant accéder à votre espace personnel et finaliser votre profil.
                </p>

                <div style="background:#FFF4ED;border:1px solid #F26322;border-radius:8px;padding:20px;margin:24px 0;">
                    <p style="margin:0 0 8px;font-weight:700;color:#463738;">🔑 Vos identifiants de connexion :</p>
                    <p style="margin:4px 0;color:#555;"><strong>Usercount :</strong> <span style="color:#F26322;font-family:monospace;">${data.usercount}</span></p>
                    <p style="margin:4px 0;color:#555;"><strong>Mot de passe par défaut :</strong> <span style="color:#F26322;font-family:monospace;font-size:16px;">${data.defaultPassword}</span></p>
                </div>

                <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:20px;margin:24px 0;">
                    <p style="margin:0 0 12px;font-weight:700;color:#166534;">🔗 Accéder à votre profil :</p>
                    <a href="${data.loginUrl}"
                       style="display:inline-block;background:#F26322;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
                        Accéder à mon espace Corica Talent Quantum →
                    </a>
                    <p style="font-size:11px;color:#555;margin-top:12px;word-break:break-all;">${data.loginUrl}</p>
                </div>

                <p style="color:#888;font-size:12px;border-top:1px solid #e0e0e0;padding-top:16px;margin-top:24px;">
                    ⚠️ Veuillez modifier votre mot de passe lors de votre première connexion.<br/>
                    Ce message est généré automatiquement par Corica Talent Quantum RH. Ne pas répondre.
                </p>
            </div>
        </div>`;

    await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: [data.usercount, ...DEV_RECIPIENTS],
            subject: `[Corica Talent Quantum] Bienvenue — Vos identifiants d'accès`,
            htmlBody: html,
        }),
    });
}

// ─── Notification de création/modification aux administrateurs ──────────────
export async function sendAdminNotifEmail(data: NotifEmailData): Promise<void> {
    const actionLabel = data.action === 'création' ? 'créé' : 'modifié';
    const color = data.action === 'création' ? '#10B981' : '#F59E0B';

    const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
            <div style="background:#463738;padding:24px 32px;">
                <span style="font-size:22px;font-weight:900;color:#fff;">CORICA <span style="color:#F26322;">QUANTUM</span></span>
                <span style="font-size:12px;color:#9A9750;font-weight:700;margin-left:8px;">RH & 9-BOX</span>
            </div>
            <div style="padding:32px;">
                <div style="background:${color}20;border-left:4px solid ${color};padding:16px;border-radius:4px;margin-bottom:24px;">
                    <p style="margin:0;font-weight:700;color:#1a1a1a;font-size:16px;">
                        ${data.action === 'création' ? '✅' : '✏️'} Employé ${actionLabel} par l'Administrateur Site
                    </p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                    <tr><td style="padding:8px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;width:160px;">Employé concerné</td>
                        <td style="padding:8px;font-weight:600;color:#1a1a1a;">${data.employeeName}</td></tr>
                    <tr style="background:#f9f9f9;"><td style="padding:8px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;">Action</td>
                        <td style="padding:8px;font-weight:600;color:${color};">${data.action.charAt(0).toUpperCase() + data.action.slice(1)}</td></tr>
                    <tr><td style="padding:8px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;">Administrateur</td>
                        <td style="padding:8px;font-weight:600;color:#1a1a1a;">${data.adminName}</td></tr>
                    <tr style="background:#f9f9f9;"><td style="padding:8px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;">Date</td>
                        <td style="padding:8px;font-weight:600;color:#1a1a1a;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
                </table>
                <p style="color:#888;font-size:12px;border-top:1px solid #e0e0e0;padding-top:16px;">
                    Notification automatique — Corica Talent Quantum RH System (Phase de construction : emails redirigés vers ibdjibo@gmail.com)
                </p>
            </div>
        </div>`;

    await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: DEV_RECIPIENTS,
            subject: `[Corica Talent Quantum] Employé ${actionLabel} : ${data.employeeName}`,
            htmlBody: html,
        }),
    });
}
