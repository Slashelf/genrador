import type { APIRoute } from "astro";
import { handleGenerate } from "../../../lib/handleGenerate";
import { canGenerate } from "../../../lib/roles";
import { buildErrorResponse } from "../../../lib/generationResponse";

export const prerender = false;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, params, locals }) => {
  if (!locals.user) {
    return json(buildErrorResponse("Debes iniciar sesión"), 401);
  }
  if (!canGenerate(locals.user.role)) {
    return json(buildErrorResponse("No autorizado"), 403);
  }
  const slug = params.slug;
  if (!slug) {
    return json(buildErrorResponse("Estilo no disponible"), 404);
  }
  return handleGenerate(request, slug, locals.user.id);
};
