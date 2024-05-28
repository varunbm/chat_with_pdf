import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("userSystem", ["system", "user"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userID: varchar("userID", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatID: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});
