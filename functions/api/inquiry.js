export async function onRequestPost({ request }) {
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
    const content = `New inquiry from SmartDevices.com

Name: ${name}
Company: ${company}
Email: ${email}

Message:
${message}
`;

    const payload = {
      personalizations: [
        { to: [{ email: "contact@smartdevices.com", name: "SmartDevices Inquiries" }] },
      ],

      // IMPORTANT: use a real address on your domain (not noreply) to avoid 401
      from: {
        email: "contact@smartdevices.com",
        name: "SmartDevices.com",
      },

      // Put the visitor as reply-to so you can just hit "Reply" in your inbox
      reply_to: { email, name },

      subject,

      content: [{ type: "text/plain", value: content }],
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const respText = await resp.text();
    if (!resp.ok) {
      return new Response(`MailChannels rejected: ${resp.status}\n${respText}`, { status: 502 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
