import { sql } from "drizzle-orm";
import { integer, serial, timestamp, uuid } from "drizzle-orm/pg-core";

export const timeStamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
};
export function _uuidRel(name: string, col: any) {
  const c = uuid(name);
  return c.references(() => col);
}
export function _serialRel(name: string, col: any) {
  const c = integer(name);
  return c.references(() => col);
}
export const __uuidPri = uuid("id").notNull().primaryKey().defaultRandom();
export const __serialPri = serial("id").primaryKey();
