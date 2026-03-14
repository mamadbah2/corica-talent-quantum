import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────
interface EmailPayload {
    to: string[];
    subject: string;
    htmlBody: string;
}

// ─── POST /api/send-email ─────────────────────────────────────────────────────
// Utilise l'API REST Resend (https://resend.com) — pas besoin de SMTP ni de 2FA
// L'utilisateur doit juste créer un compte gratuit sur resend.com et copier sa clé API
export async function POST(req: NextRequest) {
    try {
        const body: EmailPayload = await req.json();
        const { to, subject, htmlBody } = body;

        if (!to || to.length === 0 || !subject || !htmlBody) {
            return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('[send-email] RESEND_API_KEY non configurée — email non envoyé');
            return NextResponse.json({ error: 'RESEND_API_KEY non configurée dans .env.local' }, { status: 500 });
        }

        // Envoi via l'API Resend (simple appel REST, aucun package requis)
        const results = await Promise.allSettled(
            to.map(recipient =>
                fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Corica Talent Quantum RH <onboarding@resend.dev>',  // domaine de test Resend
                        to: [recipient],
                        subject,
                        html: htmlBody,
                    }),
                }).then(async res => {
                    if (!res.ok) {
                        const err = await res.text();
                        throw new Error(`Resend ${res.status}: ${err}`);
                    }
                    return res.json();
                })
            )
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
            const errors = results
                .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
                .map(r => r.reason?.message ?? String(r.reason));
            console.error('[send-email] Erreurs:', errors);
        }

        return NextResponse.json({ sent, failed, total: to.length });

    } catch (err: unknown) {
        console.error('[send-email] Erreur inattendue:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
