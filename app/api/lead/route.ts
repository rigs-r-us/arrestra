import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  firm: z.string().optional(),
  county: z.string().optional(),
  phone: z.string().optional(),
  practice: z.string().optional(),
  message: z.string().max(1000).optional(),
  consent: z.literal("on").optional(),
  hp: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
    }
    if (parsed.data.hp && parsed.data.hp.length > 0) {
      return new Response(null, { status: 204 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.LEAD_NOTIFY_EMAIL;
    if (!to) return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });

    const { name, email, firm, county, phone, practice, message, consent } = parsed.data;
    const lines = [
      "New Arrestra Intake Submission",
      "--------------------------------",
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone || "-"}`,
      `Firm:     ${firm || "-"}`,
      `County:   ${county || "-"}`,
      `Practice: ${practice || "-"}`,
      `Consent:  ${consent ? "Yes" : "No"}`,
      "",
      message ? `Message:\n${message}` : "",
    ].join("\n");

    await resend.emails.send({
      from: "Arrestra <leads@arrestra.com>",
      to,
      subject: "New Arrestra Intake",
      text: lines,
      reply_to: email,
    });

    return Response.json({ ok: true });
  } catch {
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500 });
  }
}
