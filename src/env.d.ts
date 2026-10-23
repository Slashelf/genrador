/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      name: string;
      email: string;
      role?: string | null;
    } | null;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
    } | null;
  }
}
