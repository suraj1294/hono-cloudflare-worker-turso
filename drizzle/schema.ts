import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';
import { parse } from 'valibot';

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: text('role', { enum: ['admin', 'user'] }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
  },
  (users) => ({
    inameIdx: uniqueIndex('name_idx').on(users.name),
  }),
);

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);

// Usage

export const isUserValid = parse(insertUserSchema, {
  name: 'John Doe',
  email: 'johndoe@test.com',
  role: 'admin',
});
