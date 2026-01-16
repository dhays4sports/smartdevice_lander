export async function onRequestPost({ request }) {
  try {
    // Parse form submission
    const form = await request.formData();

    const name = String(form.get("name") || "").trim();
    const company = String(form.get("company") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !company || !email || !message) {
      return json({ ok: false, error: "Missing required fields." }, 400);
    }

    if (message.length > 4000) {
      return json({ ok: false, error: "Message too long." }, 400);
    }

    // Compose email
    const subject = `SmartDevices.com Inquiry — ${company}`;
    const content =
      `New inquiry from SmartDevices.com\n\n` +
      `Name: ${name}\n` +
      `Company: ${company}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message}\n\n` +
      `---\nSent via SmartDevices.com inquiry form\n`;

    // Send via MailChannels
    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: "contact@smartdevices.com", name: "SmartDevices Inquiries" }] },
        ],
        from: { email: "noreply@smartdevices.com", name: "SmartDevices.com" },
        reply_to: { email, name },
        subject,
        content: [{ type: "text/plain", value: content }],
      }),
    });

    const respText = await resp.text();

    if (!resp.ok) {
      // IMPORTANT: return the upstream status + text so you can debug
      return json(
        { ok: false, error: `MailChannels rejected: ${resp.status}`, detail: respText },
        502
      );
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json(
      { ok: false, error: "Server error", detail: String(err && err.message ? err.message : err) },
      500
    );
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
