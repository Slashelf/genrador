import { defineMiddleware } from "astro:middleware";
import { auth } from "./auth";
import { buildErrorResponse } from "./lib/generationResponse";
import { canGenerate } from "./lib/roles";
import { safeRedirect } from "./lib/redirect";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  const { pathname } = context.url;
  const role = session?.user && "role" in session.user ? String(session.user.role || "") : "";
  const signedIn = Boolean(session?.user);
  const isGenerate = pathname === "/generate"
    || pathname.startsWith("/generate/")
    || pathname === "/api/generate"
    || pathname.startsWith("/api/generate/");
  const isAdminArea = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api/");

  if ((isGenerate || isAdminArea) && !signedIn) {
    if (isApi) {
      return json(buildErrorResponse("Debes iniciar sesión"), 401);
    }
    const redirectTo = safeRedirect(pathname);
    return context.redirect(`/login?error=auth&redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (isGenerate && !canGenerate(role)) {
    if (isApi) {
      return json(buildErrorResponse("No autorizado"), 403);
    }
    return context.redirect("/");
  }

  if (isAdminArea && role !== "admin") {
    return context.redirect("/");
  }

  return next();
});
