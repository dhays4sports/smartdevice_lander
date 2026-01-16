export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData();

    const name = String(form.get("name") || "").trim();
    const company = String(form.get("company") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !company || !email || !message) {
      return new Response("Missing fields", { status: 400 });
    }

    if (message.length > 4000) {
      return new Response("Message too long", { status: 400 });
    }

    const subject = `SmartDevices.com Inquiry — ${company}`;
    const content = `
New inquiry from SmartDevices.com

Name: ${name}
Company: ${company}
Email: ${email}

Message:
${message}

---
Sent via SmartDevices.com inquiry form
`.trim();

    // If you have env vars set in Cloudflare Pages, use them.
    const TO_EMAIL = env?.TO_EMAIL || "contact@smartdevices.com";
    const FROM_EMAIL = env?.FROM_EMAIL || "noreply@smartdevices.com"; // may need adjustment

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO_EMAIL, name: "SmartDevices Inquiries" }] }],
        from: { email: FROM_EMAIL, name: "SmartDevices.com" },
        reply_to: { email, name },
        subject,
        content: [{ type: "text/plain", value: content }],
      }),
    });

    if (!resp.ok) {
      const details = await resp.text();
      return new Response(`Email send failed: ${details}`, { status: 502 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
