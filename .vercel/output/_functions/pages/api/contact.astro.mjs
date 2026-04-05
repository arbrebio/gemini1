import { z } from "zod";
import { g as globalRateLimiter, c as createErrorResponse, s as sanitizeInput, a as createSuccessResponse, h as handleApiError } from "../../chunks/errorHandling_Bo23yK1B.mjs";
import { f } from "../../chunks/vendor_Cx2pFmu4.mjs";
const prerender = false;
const ADMIN_EMAIL = "farms@arbrebio.com";
const FROM_ADDRESS = "Arbre Bio Africa <farms@newsletter.arbrebio.com>";
const emailT = {
  en: {
    subject: "Thank you for contacting Arbre Bio Africa",
    greeting: "Dear",
    body: (interest) => `Thank you for reaching out to us. We have received your message regarding ${interest}.`,
    response: "Our team will review your inquiry and get back to you within 24-48 business hours.",
    assistance: "For immediate assistance:",
    call: "Call:",
    signoff: "Best regards,",
    team: "The Arbre Bio Africa Team",
    footer: "This is an automated response. Please do not reply to this email."
  },
  fr: {
    subject: "Merci de nous avoir contacté - Arbre Bio Africa",
    greeting: "Cher/Chère",
    body: (interest) => `Merci de nous avoir contacté. Nous avons bien reçu votre message concernant ${interest}.`,
    response: "Notre équipe examinera votre demande et vous répondra dans les 24 à 48 heures ouvrables.",
    assistance: "Pour une assistance immédiate :",
    call: "Appelez-nous :",
    signoff: "Cordialement,",
    team: "L'équipe Arbre Bio Africa",
    footer: "Ceci est une réponse automatique. Veuillez ne pas répondre à cet email."
  },
  es: {
    subject: "Gracias por contactar a Arbre Bio Africa",
    greeting: "Estimado/a",
    body: (interest) => `Gracias por ponerse en contacto con nosotros. Hemos recibido su mensaje sobre ${interest}.`,
    response: "Nuestro equipo revisará su consulta y le responderá en un plazo de 24 a 48 horas hábiles.",
    assistance: "Para asistencia inmediata:",
    call: "Llámenos:",
    signoff: "Saludos cordiales,",
    team: "El equipo de Arbre Bio Africa",
    footer: "Esta es una respuesta automática. Por favor, no responda a este correo electrónico."
  },
  af: {
    subject: "Dankie vir u kontak - Arbre Bio Africa",
    greeting: "Geagte",
    body: (interest) => `Dankie dat u ons gekontak het. Ons het u boodskap oor ${interest} ontvang.`,
    response: "Ons span sal u navraag hersien en binne 24 tot 48 besigheidsure reageer.",
    assistance: "Vir onmiddellike hulp:",
    call: "Skakel ons:",
    signoff: "Met vriendelike groete,",
    team: "Die Arbre Bio Africa span",
    footer: "Dit is 'n outomatiese antwoord. Reageer asseblief nie op hierdie e-pos nie."
  }
};
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "First name contains invalid characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name contains invalid characters"),
  email: z.string().email("Please enter a valid email address").max(100, "Email address too long"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long").regex(/^[\+]?[0-9\s\-\(\)]+$/, "Phone number contains invalid characters"),
  interest: z.string().min(1, "Please select an area of interest").max(100, "Interest selection too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1e3, "Message too long"),
  lang: z.enum(["en", "fr", "es", "af"]).default("en")
});
async function sendEmail(to, subject, html, replyTo) {
  const resendKey = "re_HSRiDzvW_Lm6qocMgZGsDbXTnDCBVqNjt";
  const body = {
    from: FROM_ADDRESS,
    to: Array.isArray(to) ? to : [to],
    subject,
    html
  };
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", res.status, text);
  }
}
const POST = async ({ request }) => {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!globalRateLimiter.isAllowed(clientIP)) {
      return createErrorResponse("Too many requests. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
    }
    const data = await request.json();
    const validationResult = contactSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return createErrorResponse(firstError.message, 400, "VALIDATION_ERROR");
    }
    const { firstName, lastName, email, phone, interest, message, lang } = validationResult.data;
    const d = {
      firstName: sanitizeInput(firstName, 50),
      lastName: sanitizeInput(lastName, 50),
      email: sanitizeInput(email, 100),
      phone: sanitizeInput(phone, 20),
      interest: sanitizeInput(interest, 100),
      message: sanitizeInput(message, 1e3)
    };
    await sendEmail(
      ADMIN_EMAIL,
      `New Contact Form Submission: ${d.interest}`,
      `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #194642;">New Contact Form Submission</h1>
            <h2 style="color: #666;">Contact Information</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${d.firstName} ${d.lastName}</li>
              <li><strong>Email:</strong> ${d.email}</li>
              <li><strong>Phone:</strong> ${d.phone}</li>
              <li><strong>Interest:</strong> ${d.interest}</li>
            </ul>
            <h2 style="color: #666;">Message</h2>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${d.message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Sent from arbrebio.com contact form<br>
              Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}<br>
              IP: ${clientIP}
            </p>
          </body>
        </html>
      `,
      d.email
    );
    const t = emailT[lang] ?? emailT.en;
    await sendEmail(
      d.email,
      t.subject,
      `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #194642;">${t.subject}</h1>
            <p>${t.greeting} ${d.firstName} ${d.lastName},</p>
            <p>${t.body(d.interest.toLowerCase())}</p>
            <p>${t.response}</p>
            <p>${t.assistance}</p>
            <ul>
              <li>${t.call} +225 21 21 80 69 50</li>
              <li>WhatsApp: +225 05 00 55 25 25</li>
            </ul>
            <p>${t.signoff}<br>${t.team}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Arbre Bio Africa | Cocody Riviera 3, Jacque Prevert 2 | Abidjan, Côte d'Ivoire<br>
              ${t.footer}
            </p>
          </body>
        </html>
      `
    );
    return createSuccessResponse(null, "Message sent successfully");
  } catch (error) {
    return handleApiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  f as renderers
};
