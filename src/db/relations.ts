import { defineRelations } from "drizzle-orm";
import { user } from "./auth-schema";
import { generations, styles } from "./schema";

export const relations = defineRelations({ styles, generations, user }, (r) => ({
  styles: {
    generations: r.many.generations({
      from: r.styles.id,
      to: r.generations.styleId,
    }),
  },
  generations: {
    style: r.one.styles({
      from: r.generations.styleId,
      to: r.styles.id,
    }),
    author: r.one.user({
      from: r.generations.userId,
      to: r.user.id,
    }),
  },
}));
