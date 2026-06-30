const resendApiUrl = "https://api.resend.com";

function getResendHeaders() {
  return {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function readResendResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export async function verifyEmailConnection() {
  if (!isEmailConfigured()) {
    return { ok: false, configured: false, reason: "missing-resend" };
  }

  try {
    const response = await fetch(`${resendApiUrl}/domains`, {
      headers: getResendHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    const data = await readResendResponse(response);

    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        reason: "resend-rejected",
        status: response.status,
        message: data.message || data.error || "Resend rechazo la solicitud.",
      };
    }

    return { ok: true, configured: true };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      reason: "resend-unreachable",
      message: error.message,
    };
  }
}

export async function sendAccountConfirmationEmail(user, token) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "missing-resend" };
  }

  const appUrl = process.env.PUBLIC_APP_URL || "https://e-shop-ayre.onrender.com";
  const confirmUrl = `${appUrl}/api/users/confirm/${token}`;
  const response = await fetch(`${resendApiUrl}/emails`, {
    method: "POST",
    headers: getResendHeaders(),
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: user.email,
      subject: "Confirma tu cuenta AyRe",
      text: `Hola ${user.name}, confirma tu cuenta para poder comprar en AyRe: ${confirmUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#241913">
          <h1>Confirma tu cuenta AyRe</h1>
          <p>Hola ${user.name}, necesitamos confirmar tu email para activar tu cuenta y habilitar tus compras.</p>
          <p><a href="${confirmUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#9b7350;color:white;text-decoration:none">Activar cuenta</a></p>
          <p>Si el boton no funciona, copia este enlace:</p>
          <p>${confirmUrl}</p>
        </div>
      `,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await readResendResponse(response);

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Resend no pudo enviar el email.");
    error.status = response.status;
    error.provider = "resend";
    throw error;
  }

  return { sent: true, provider: "resend", id: data.id };
}
