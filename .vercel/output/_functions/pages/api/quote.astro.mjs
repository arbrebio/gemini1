import { z } from "zod";
import { c as config } from "../../chunks/config_5grJm-95.mjs";
import { f } from "../../chunks/vendor_Cx2pFmu4.mjs";
const prerender = false;
const ADMIN_EMAIL = config.contact.adminEmail;
const SENDER_NAME = config.contact.senderName;
const FROM_ADDRESS = `${SENDER_NAME} <farms@newsletter.arbrebio.com>`;
const quoteT = {
  en: {
    subject: "Thank you for your quote request - Arbre Bio Africa",
    greeting: "Dear",
    body: (type) => `Thank you for your interest in our ${type} solutions. We have received your quote request and our team will review it carefully.`,
    response: "You can expect to hear from us within 24-48 business hours with a detailed proposal.",
    assistance: "For immediate assistance:",
    call: "Call:",
    email: "Email:",
    signoff: "Best regards,",
    team: "The Arbre Bio Africa Team",
    types: { greenhouse: "greenhouse", irrigation: "irrigation", substrate: "substrate", general: "agricultural" }
  },
  fr: {
    subject: "Merci pour votre demande de devis - Arbre Bio Africa",
    greeting: "Cher/Chère",
    body: (type) => `Merci pour votre intérêt pour nos solutions ${type}. Nous avons bien reçu votre demande de devis et notre équipe l'examinera attentivement.`,
    response: "Vous pouvez vous attendre à recevoir une proposition détaillée dans les 24 à 48 heures ouvrables.",
    assistance: "Pour une assistance immédiate :",
    call: "Appelez-nous :",
    email: "Email :",
    signoff: "Cordialement,",
    team: "L'équipe Arbre Bio Africa",
    types: { greenhouse: "serres", irrigation: "irrigation", substrate: "substrat", general: "agricoles" }
  },
  es: {
    subject: "Gracias por su solicitud de presupuesto - Arbre Bio Africa",
    greeting: "Estimado/a",
    body: (type) => `Gracias por su interés en nuestras soluciones de ${type}. Hemos recibido su solicitud de presupuesto y nuestro equipo la revisará detenidamente.`,
    response: "Puede esperar recibir una propuesta detallada en un plazo de 24 a 48 horas hábiles.",
    assistance: "Para asistencia inmediata:",
    call: "Llámenos:",
    email: "Correo:",
    signoff: "Saludos cordiales,",
    team: "El equipo de Arbre Bio Africa",
    types: { greenhouse: "invernadero", irrigation: "irrigación", substrate: "sustrato", general: "agrícolas" }
  },
  af: {
    subject: "Dankie vir u kwotasieversoek - Arbre Bio Africa",
    greeting: "Geagte",
    body: (type) => `Dankie vir u belangstelling in ons ${type} oplossings. Ons het u kwotasieversoek ontvang en ons span sal dit noukeurig hersien.`,
    response: "U kan verwag om binne 24 tot 48 besigheidsure 'n gedetailleerde voorstel te ontvang.",
    assistance: "Vir onmiddellike hulp:",
    call: "Skakel ons:",
    email: "E-pos:",
    signoff: "Met vriendelike groete,",
    team: "Die Arbre Bio Africa span",
    types: { greenhouse: "kweekhuis", irrigation: "besproeiing", substrate: "substraat", general: "landbou" }
  }
};
const quoteSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
  location: z.string().min(1, "Location is required").max(100, "Location too long").optional(),
  size: z.number().min(1, "Size must be at least 1").max(1e5, "Size too large").optional(),
  timeline: z.string().optional(),
  requirements: z.string().max(500, "Requirements too long").optional(),
  productType: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").optional(),
  quoteType: z.enum(["greenhouse", "irrigation", "substrate", "general"]).default("general"),
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
    const data = await request.json();
    const validationResult = quoteSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(JSON.stringify({ success: false, message: firstError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const v = validationResult.data;
    const emailSubject = `New Quote Request: ${v.quoteType.charAt(0).toUpperCase() + v.quoteType.slice(1)}`;
    let emailContent = `
      <h1 style="color: #194642;">New Quote Request</h1>
      <h2 style="color: #666;">Contact Information</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${v.firstName} ${v.lastName}</li>
        <li><strong>Email:</strong> ${v.email}</li>
        <li><strong>Phone:</strong> ${v.phone}</li>
        <li><strong>Quote Type:</strong> ${v.quoteType}</li>
      </ul>
    `;
    if (v.quoteType === "greenhouse") {
      emailContent += `
        <h2 style="color: #666;">Project Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${v.location ? `<li><strong>Location:</strong> ${v.location}</li>` : ""}
          ${v.size ? `<li><strong>Size:</strong> ${v.size} m²</li>` : ""}
          ${v.timeline ? `<li><strong>Timeline:</strong> ${v.timeline}</li>` : ""}
        </ul>
      `;
    }
    if (v.quoteType === "substrate") {
      emailContent += `
        <h2 style="color: #666;">Product Details</h2>
        <ul style="list-style: none; padding: 0;">
          ${v.productType ? `<li><strong>Product Type:</strong> ${v.productType}</li>` : ""}
          ${v.quantity ? `<li><strong>Quantity:</strong> ${v.quantity} metric tons</li>` : ""}
        </ul>
      `;
    }
    if (v.requirements) {
      emailContent += `
        <h2 style="color: #666;">Additional Requirements</h2>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${v.requirements}</p>
      `;
    }
    emailContent += `
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        Sent from ${SENDER_NAME} website<br>
        Timestamp: ${(/* @__PURE__ */ new Date()).toLocaleString()}
      </p>
    `;
    await sendEmail(ADMIN_EMAIL, emailSubject, emailContent, v.email);
    const t = quoteT[v.lang] ?? quoteT.en;
    const translatedType = t.types[v.quoteType];
    await sendEmail(
      v.email,
      t.subject,
      `
        <h1 style="color: #194642;">${t.subject}</h1>
        <p>${t.greeting} ${v.firstName} ${v.lastName},</p>
        <p>${t.body(translatedType)}</p>
        <p>${t.response}</p>
        <p>${t.assistance}</p>
        <ul>
          <li>${t.call} ${config.contact.offices[0]?.phone || config.contact.whatsappNumber}</li>
          <li>WhatsApp: ${config.contact.whatsappNumber}</li>
          <li>${t.email} ${ADMIN_EMAIL}</li>
        </ul>
        <p>${t.signoff}<br>${t.team}</p>
      `
    );
    return new Response(JSON.stringify({ success: true, message: "Quote request sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Quote request error:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to send quote request. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
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
