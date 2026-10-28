import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { admin } from "better-auth/plugins";
import { db } from "./db/client";
import * as authSchema from "./db/auth-schema";

const authSecret = process.env.BETTER_AUTH_SECRET?.trim() || "";
const authUrl = process.env.BETTER_AUTH_URL || "http://localhost:4321";
if (!authSecret && (process.env.NODE_ENV === "production" || authUrl.startsWith("https://"))) {
  throw new Error("BETTER_AUTH_SECRET no está configurada");
}

export const auth = betterAuth({
  secret: authSecret || "dev-only-secret-change-me-please-32",
  baseURL: authUrl,
  trustedOrigins: [
    "http://localhost:4321",
    "http://127.0.0.1:4321",
    "http://192.168.*:4321",
    "https://feria.inginformatica.app",
    "https://feria.cimasoft.app",
  ],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: "operator",
      adminRoles: ["admin"],
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
    camelCase: true,
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
});
