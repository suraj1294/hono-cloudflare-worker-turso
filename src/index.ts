import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { jwt, sign } from 'hono/jwt';

import { vValidator } from '@hono/valibot-validator';
import { object, string } from 'valibot';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { insertUserSchema, selectUserSchema, users } from '../drizzle/schema';
import { Bindings } from './env';
import getDbInstance from './db';

declare module 'hono' {
  interface ContextVariableMap {
    db: LibSQLDatabase;
  }
}

const authSchema = object({
  username: string(),
  password: string(),
});

const app = new Hono<{ Bindings: Bindings }>();

console.log('called');

app.use('*', async (c, next) => {
  const db = getDbInstance(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);
  c.set('db', db);

  await next();
});

app.get('/', serveStatic({ root: './' }));
app.get(
  '/assets/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) => path.replace(/^\/assets/, '/assets'),
  }),
);
app.get('/vite.svg', serveStatic({ path: './vite.svg' }));

app.use('/auth/*', async (c, next) => {
  const JWT = jwt({ secret: c.env.TOKEN_SECRET });
  await JWT(c, next);
});

app.post('/sign-in', vValidator('json', authSchema), async (c) => {
  console.log(c);
  const body = c.req.valid('json');

  const token = await sign({ username: body.username }, c.env.TOKEN_SECRET);

  return c.json({ ok: 'true', data: token });
});

app.get('/auth/me', (c) => {
  const payload = c.get('jwtPayload');

  return c.json(payload);
});

app.get('/users', async (c) => {
  const allUsers = await c.get('db').select().from(users).all();
  return c.json(allUsers);
});

const insertUserRequest = insertUserSchema;
const insertUserResponse = selectUserSchema;

app.post('/users', vValidator('json', insertUserRequest), async (ctx) => {
  const data = ctx.req.valid('json');
  const user = await ctx.get('db').insert(users).values(data).returning().get();
  return ctx.json(insertUserResponse._parse(user));
});

app.onError(async (err, c) => {
  return c.json('failed to serve');
});

export default app;
