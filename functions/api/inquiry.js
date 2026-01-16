export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get("name");
    const company = formData.get("company");
    const email = formData.get("email");
    const message = formData.get("message");

    console.log("New inquiry:", { name, company, email, message });

    return new Response("OK", { status: 200 });

  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}
