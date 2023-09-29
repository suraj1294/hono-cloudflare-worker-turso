import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import { qb } from './db';

export const userQueries = () => {
  const getUsers = () => qb.select().from(users).toSQL();
  const getUserById = (userId = 2000) =>
    qb.select().from(users).where(eq(users.id, +userId)).toSQL();

  return { getUsers, getUserById };
};
