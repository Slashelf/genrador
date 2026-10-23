import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db/client";
import { ICON_OPTIONS } from "../../../db/style-seeds";
import { styles } from "../../../db/schema";
import { buildErrorResponse } from "../../../lib/generationResponse";

export const prerender = false;

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(400),
  icon: z.string().refine((value) => ICON_OPTIONS.includes(value)),
  promptTemplate: z.string().min(1),
  detailsHint: z.string().min(1).max(160),
  active: z.enum(["0", "1"]),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!locals.user || locals.user.role !== "admin") {
    return new Response(JSON.stringify(buildErrorResponse("No autorizado")), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const parsed = updateSchema.safeParse({
    id: form.get("id"),
    name: form.get("name"),
    description: form.get("description"),
    icon: form.get("icon"),
    promptTemplate: form.get("promptTemplate"),
    detailsHint: form.get("detailsHint"),
    active: form.getAll("active").includes("1") ? "1" : "0",
  });
  if (!parsed.success) {
    return new Response(JSON.stringify(buildErrorResponse("Datos del estilo inválidos")), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = parsed.data;
  await db.update(styles).set({
    name: data.name,
    description: data.description,
    icon: data.icon,
    promptTemplate: data.promptTemplate,
    detailsHint: data.detailsHint,
    active: data.active === "1",
  }).where(eq(styles.id, data.id));

  return redirect("/admin/estilos?saved=1");
};
