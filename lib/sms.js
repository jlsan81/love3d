export async function sendAdminSms(code) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.ADMIN_PHONE;

  if (!sid || !token || !from || !to) {
    throw new Error("SMS não configurado. Defina TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM e ADMIN_PHONE.");
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `Seu código de acesso ao painel Love3D é ${code}. Ele expira em 5 minutos.`,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao enviar SMS: ${text.slice(0, 300)}`);
  }
}
