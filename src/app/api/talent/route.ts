import { NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { storeLead, notifyLead, hasDb, type LeadInput } from "@/lib/leads";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Envío inválido." }, { status: 400 });
  }
  const get = (k: string) => ((form.get(k) as string) || "").trim();

  if (get("website_hp")) return NextResponse.json({ ok: true }); // bot

  const name = get("name");
  const email = get("email");
  const role = get("role");
  if (!name || !email || !role) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos obligatorios (nombre, email, rol)." },
      { status: 422 }
    );
  }

  // CV opcional
  let cvUrl = "";
  const file = form.get("cv") as File | null;
  if (file && typeof file === "object" && file.size > 0) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "El CV debe ser PDF, DOC o DOCX." },
        { status: 422 }
      );
    }
    if (file.size > MAX) {
      return NextResponse.json({ ok: false, error: "El CV supera 8 MB." }, { status: 422 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const safe = (file.name || "cv").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${Date.now()}-${safe}`;

    if (hasDb()) {
      const supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        { auth: { persistSession: false } }
      );
      const { error } = await supabase.storage
        .from("cv")
        .upload(key, buf, { contentType: file.type, upsert: false });
      if (error) {
        console.error("cv upload error:", error.message);
      } else {
        const { data } = supabase.storage.from("cv").getPublicUrl(key);
        cvUrl = data.publicUrl;
      }
    } else {
      const dir = path.join(process.cwd(), ".data", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, key), buf);
      cvUrl = `local:.data/uploads/${key}`;
    }
  }

  const extraLinks = [get("links"), cvUrl ? `CV: ${cvUrl}` : ""]
    .filter(Boolean)
    .join(" · ");

  const lead: LeadInput = {
    kind: "talento",
    name,
    email,
    phone: get("phone"),
    role,
    portfolio: get("portfolio"),
    behance: get("behance"),
    reel: get("reel"),
    web: get("web"),
    links: extraLinks,
    meta: cvUrl ? { cvUrl } : undefined,
  };

  try {
    await storeLead(lead);
  } catch (err) {
    console.error("storeLead error:", err);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar tu postulación. Intenta de nuevo." },
      { status: 500 }
    );
  }
  // after(): en Vercel el aviso sí se envía (el fire-and-forget se moría al responder)
  after(() => notifyLead(lead).catch((err) => console.error("notifyLead error:", err)));

  return NextResponse.json({ ok: true });
}
