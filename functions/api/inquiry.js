export async function onRequestPost({ request, env }) {
  // CORS (safe defaults)
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "https://smartdevices.com",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };

  try {
    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let company = "";
    let email = "";
    let message = "";

    // Accept either form posts or JSON posts
    if (contentType.includes("application/json")) {
      const data = await request.json();
      name = String(data.name || "").trim();
      company = String(data.company || "").trim();
      email = String(data.email || "").trim();
      message = String(data.message || "").trim();
    } else {
      const form = await request.formData();
      name = String(form.get("name") || "").trim();
      company = String(form.get("company") || "").trim();
      email = String(form.get("email") || "").trim();
      message = String(form.get("message") || "").trim();
    }

    if (!name || !company || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields." }), {
        status: 400,
        headers,
      });
    }

    // Basic email sanity check (not perfect, but helps)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Please enter a valid email." }), {
        status: 400,
        headers,
      });
    }

    if (message.length > 4000) {
      return new Response(JSON.stringify({ ok: false, error: "Message too long." }), {
        status: 400,
        headers,
      });
    }

    const subject = `SmartDevices.com Inquiry — ${company}`;
    const bodyText =
`New inquiry from SmartDevices.com

Name: ${name}
Company: ${company}
Email: ${email}

Message:
${message}

---
Sent via SmartDevices.com inquiry form`;

    // IMPORTANT:
    // MailChannels can be picky about From domains.
    // Start with a "from" that matches the destination domain.
    // If this still fails, we’ll switch to a verified sender method.
    const payload = {
      personalizations: [
        {
          to: [{ email: "contact@smartdevices.com", name: "SmartDevices Inquiries" }],
        },
      ],
      from: {
        email: "contact@smartdevices.com",
        name: "SmartDevices.com",
      },
      reply_to: { email, name },
      subject,
      content: [{ type: "text/plain", value: bodyText }],
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const respText = await resp.text();

    if (!resp.ok) {
      // Return the MailChannels error *to you* (still JSON), so you can debug without guessing.
      return new Response(JSON.stringify({
        ok: false,
        error: `Mail send failed (${resp.status})`,
        detail: respText.slice(0, 800),
      }), {
        status: 502,
        headers,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Server error." }), {
      status: 500,
      headers,
    });
  }
}

// Optional: handle OPTIONS preflight (some browsers/extensions trigger it)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "https://smartdevices.com",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}
