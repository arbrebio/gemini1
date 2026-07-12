/**
 * Shared Resend email helpers for sales-agent account notifications.
 * Every email sent here is triggered server-side — never from the client.
 *
 * Requires: RESEND_API_KEY environment variable
 */

import { Resend } from 'resend';

// newsletter.arbrebio.com is the verified Resend sending domain.
// arbrebio.com can be used as reply-to so agents can reply directly.
const FROM_EMAIL  = 'noreply@newsletter.arbrebio.com';
const FROM_NAME   = 'Arbre Bio Africa';
const REPLY_TO    = 'farms@arbrebio.com';
const SITE_URL    = (import.meta.env.SITE ?? 'https://arbrebio.com').replace(/\/$/, '');
const PORTAL_URL  = `${SITE_URL}/sales-agent/login/`;

function getResendClient(): Resend {
  const key = import.meta.env.RESEND_API_KEY ?? '';
  if (!key || key.startsWith('your_')) throw new Error('RESEND_API_KEY not configured');
  return new Resend(key);
}

// ── Shared HTML wrapper ──────────────────────────────────────────────────────
function emailWrapper(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
  .header{background:#194642;padding:28px 32px;text-align:center;}
  .header img{height:48px;border-radius:8px;background:rgba(255,255,255,.1);padding:4px;}
  .header h1{color:#fff;font-size:1.1rem;font-weight:700;margin:12px 0 0;}
  .body{padding:28px 32px;}
  .body p{color:#374151;font-size:0.9rem;line-height:1.6;margin:0 0 14px;}
  .cred-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;}
  .cred-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
  .cred-row:last-child{margin-bottom:0;}
  .cred-label{font-size:0.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;min-width:100px;}
  .cred-value{font-size:0.9rem;font-weight:700;color:#111827;font-family:monospace;background:#fff;padding:4px 10px;border-radius:6px;border:1px solid #d1fae5;word-break:break-all;}
  .btn{display:inline-block;background:#194642;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:0.9rem;margin:8px 0;}
  .warn-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:16px 0;}
  .warn-box p{color:#c2410c;margin:0;font-size:0.82rem;}
  .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;}
  .footer p{font-size:0.75rem;color:#9ca3af;margin:0;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <img src="${SITE_URL}/logo.png" alt="Arbre Bio Africa"/>
    <h1>Arbre Bio Africa — Portail Agent Commercial</h1>
  </div>
  <div class="body">${bodyHtml}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Arbre Bio Africa · Cet e-mail est envoyé automatiquement, ne pas répondre.</p>
    <p style="margin-top:4px"><a href="${SITE_URL}" style="color:#194642">${SITE_URL}</a></p>
  </div>
</div>
</body>
</html>`;
}

// ── 1. Welcome / new account email ──────────────────────────────────────────
export async function sendWelcomeEmail(opts: {
  to: string;
  full_name: string;
  temp_password: string;
}) {
  const resend = getResendClient();
  const html = emailWrapper(`
    <p>Bonjour <strong>${opts.full_name}</strong>,</p>
    <p>Votre compte <strong>Agent Commercial Arbre Bio Africa</strong> a été créé avec succès. Voici vos identifiants de connexion&nbsp;:</p>
    <div class="cred-box">
      <div class="cred-row">
        <span class="cred-label">E-mail</span>
        <span class="cred-value">${opts.to}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Mot de passe</span>
        <span class="cred-value">${opts.temp_password}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Lien portail</span>
        <span class="cred-value">${PORTAL_URL}</span>
      </div>
    </div>
    <div class="warn-box">
      <p>⚠️ <strong>Mot de passe temporaire</strong> — Il vous sera demandé de le remplacer par votre propre mot de passe dès votre première connexion.</p>
    </div>
    <p style="text-align:center;margin-top:24px;">
      <a class="btn" href="${PORTAL_URL}">🌿 Accéder au portail agent</a>
    </p>
    <p style="font-size:0.8rem;color:#6b7280;margin-top:20px;">Si vous n'attendiez pas ce message, ignorez-le ou contactez votre administrateur à <a href="mailto:${REPLY_TO}" style="color:#194642">${REPLY_TO}</a>.</p>
  `);

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: opts.to,
    subject: '🌿 Vos identifiants — Portail Agent Arbre Bio Africa',
    html,
  });

  if (error) throw new Error(error.message);
}

// ── 2. Admin-triggered password reset email ──────────────────────────────────
export async function sendPasswordResetEmail(opts: {
  to: string;
  full_name: string;
  temp_password: string;
}) {
  const resend = getResendClient();
  const html = emailWrapper(`
    <p>Bonjour <strong>${opts.full_name}</strong>,</p>
    <p>Votre mot de passe a été <strong>réinitialisé</strong> par un administrateur. Voici vos nouveaux identifiants temporaires&nbsp;:</p>
    <div class="cred-box">
      <div class="cred-row">
        <span class="cred-label">E-mail</span>
        <span class="cred-value">${opts.to}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Nouveau MDP</span>
        <span class="cred-value">${opts.temp_password}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">Lien portail</span>
        <span class="cred-value">${PORTAL_URL}</span>
      </div>
    </div>
    <div class="warn-box">
      <p>⚠️ Il vous sera demandé de choisir votre propre mot de passe dès votre prochaine connexion.</p>
    </div>
    <p style="text-align:center;margin-top:24px;">
      <a class="btn" href="${PORTAL_URL}">🔑 Se connecter maintenant</a>
    </p>
    <p style="font-size:0.8rem;color:#6b7280;margin-top:20px;">Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement votre administrateur à <a href="mailto:${REPLY_TO}" style="color:#194642">${REPLY_TO}</a>.</p>
  `);

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: opts.to,
    subject: '🔑 Réinitialisation de votre mot de passe — Arbre Bio Africa',
    html,
  });

  if (error) throw new Error(error.message);
}

// ── 3. Password changed confirmation email ───────────────────────────────────
export async function sendPasswordChangedEmail(opts: {
  to: string;
  full_name: string;
}) {
  const resend = getResendClient();
  const changedAt = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Abidjan',
  });
  const html = emailWrapper(`
    <p>Bonjour <strong>${opts.full_name}</strong>,</p>
    <p>Votre mot de passe a été <strong>modifié avec succès</strong> le <strong>${changedAt}</strong>.</p>
    <p>Si vous êtes à l'origine de ce changement, vous pouvez ignorer ce message.</p>
    <div class="warn-box">
      <p>⚠️ Si vous <strong>n'avez pas</strong> effectué ce changement, contactez immédiatement votre administrateur ou écrivez à <a href="mailto:${REPLY_TO}" style="color:#c2410c">${REPLY_TO}</a>.</p>
    </div>
    <p style="text-align:center;margin-top:24px;">
      <a class="btn" href="${PORTAL_URL}">Accéder au portail</a>
    </p>
  `);

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to: opts.to,
    subject: '✅ Mot de passe modifié — Arbre Bio Africa',
    html,
  });

  if (error) throw new Error(error.message);
}
