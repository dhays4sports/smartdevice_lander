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
    const content = [
      "New inquiry from SmartDevices.com",
      "",
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
      "",
      "---",
      "Sent via SmartDevices.com inquiry form",
    ].join("\n");

    const payload = {
      personalizations: [
        { to: [{ email: "contact@smartdevices.com", name: "SmartDevices Inquiries" }] },
      ],
      from: { email: "noreply@smartdevices.com", name: "SmartDevices.com" },
      reply_to: { email, name },
      subject,
      content: [{ type: "text/plain", value: content }],
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const respText = await resp.text();
      return new Response(`MailChannels error (${resp.status}):\n${respText}`, { status: 502 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    // Log something helpful into CF logs
    return new Response("Server error", { status: 500 });
  }
}
