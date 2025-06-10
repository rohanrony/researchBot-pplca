import { sql } from 'drizzle-orm';
import {
  text,
  integer,
  sqliteTable,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

import { nanoid } from "nanoid";


export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('type', { enum: ['assistant', 'user'] }),
  metadata: text('metadata', {
    mode: 'json',
  }),
  // plotData: text("plot_data"),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: text('files', { mode: 'json' })
    .$type<File[]>()
    .default(sql`'[]'`),
});

export const user = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const otp = sqliteTable('otp', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  purpose: text('purpose').notNull(), // "verification" or "password-reset"
  expires: text('expires').notNull(), // ISO date string
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type OTP = typeof otp.$inferSelect;
export type NewOTP = typeof otp.$inferInsert;
