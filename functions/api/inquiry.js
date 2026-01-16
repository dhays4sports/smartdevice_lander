    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: "contact@smartdevices.com", name: "SmartDevices Inquiries" }] },
        ],
        from: {
          email: "noreply@smartdevices.com",
          name: "SmartDevices.com",
        },
        reply_to: { email, name },
        subject,
        content: [{ type: "text/plain", value: content }],
      }),
    });

    const respText = await resp.text();

    if (!resp.ok) {
      return new Response(`MailChannels error (${resp.status}):\n${respText}`, {
        status: 502,
        headers: { "content-type": "text/plain" },
      });
    }

    return new Response("OK", { status: 200 });
