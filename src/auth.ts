import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { admin } from "better-auth/plugins";
import { db } from "./db/client";
import * as authSchema from "./db/auth-schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-only-secret-change-me-please-32",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
  trustedOrigins: [
    "http://localhost:4321",
    "https://feria.inginformatica.app",
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
