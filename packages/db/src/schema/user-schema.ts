import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  __serialPri,
  __uuidPri,
  _serialRel,
  _uuidRel,
  timeStamps,
} from "./schema-helper";

export const User = pgTable("users", {
  id: __uuidPri,
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
  password: text("password"),
  role: varchar("role", { length: 20 }), // e.g., "admin", "editor", "viewer"
  status: varchar("status", { length: 20 }),
});

export const MediaAuthor = pgTable("media_author", {
  id: __serialPri,
  name: text("name").notNull(),
  meta: jsonb("meta").default({}),
  ...timeStamps,
});

export const TelegramChannel = pgTable("telegram_channel", {
  id: __serialPri,
  title: varchar("name").notNull(),
  username: varchar("username"),
  channelId: integer("channel_id"),
  type: text("type").notNull(),
  meta: jsonb("meta").default({}),
  ...timeStamps,
});
export const Notification = pgTable("Notification", {
  id: __serialPri,
  userId: _uuidRel("user_id", User.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // e.g., "blog_update", "note_published"
  isRead: boolean("is_read").default(false),
  ...timeStamps,
});
export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  ...timeStamps,
});
export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);
