import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
  real,
  unique,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `swe-shop_${name}`);

export const items = createTable(
  "item",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    description: text("description", { length: 1000 }).default(""),
    price: real("price").default(0),
    condition: text("condition", { length: 50 }).default("used"),
    category: text("category", { length: 100 }).default("other"),
    imageUrl: text("image_url"),
    createdById: text("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
    categoryIndex: index("category_idx").on(example.category),
  }),
);

export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, {
    fields: [items.createdById],
    references: [users.id],
  }),
}));

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull().unique(), // Add unique constraint
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
  password: text("password", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  items: many(items),
  buyerConversations: many(conversations, { relationName: "buyer" }),
  sellerConversations: many(conversations, { relationName: "seller" }),
  sentMessages: many(messages),
}));

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    identifierIdx: unique("verification_token_identifier_idx").on(
      vt.identifier,
    ), // Add unique constraint on identifier
  }),
);

export const conversations = createTable(
  "conversation",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    buyerId: text("buyer_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    sellerId: text("seller_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    itemId: int("item_id").references(() => items.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    buyerIdIdx: index("buyer_id_idx").on(table.buyerId),
    sellerIdIdx: index("seller_id_idx").on(table.sellerId),
    itemIdIdx: index("convo_item_id_idx").on(table.itemId),
  }),
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    buyer: one(users, {
      fields: [conversations.buyerId],
      references: [users.id],
    }),
    seller: one(users, {
      fields: [conversations.sellerId],
      references: [users.id],
    }),
    item: one(items, {
      fields: [conversations.itemId],
      references: [items.id],
    }),
    messages: many(messages),
  }),
);

export const messages = createTable(
  "message",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    conversationId: int("conversation_id")
      .notNull()
      .references(() => conversations.id),
    senderId: text("sender_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    read: int("read", { mode: "boolean" }).default(0),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    conversationIdIdx: index("conversation_id_idx").on(table.conversationId),
    senderIdIdx: index("sender_id_idx").on(table.senderId),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
