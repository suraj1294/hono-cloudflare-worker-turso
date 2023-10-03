import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { jwt, sign } from 'hono/jwt';

import { vValidator } from '@hono/valibot-validator';
import { object, string } from 'valibot';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { insertUserSchema, selectUserSchema, users } from '../drizzle/schema';
import { Bindings } from './env';
import getDbInstance from './db';
import { eq } from 'drizzle-orm';
import { Client } from '@libsql/client/.';
import * as schema from '../drizzle/schema';
import { compareHash } from './utils/encryption';

declare module 'hono' {
  interface ContextVariableMap {
    orm: LibSQLDatabase<typeof schema>;
    libsql: Client;
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
  c.set('orm', db.drizzleClient);
  c.set('libsql', db.libSQLClient);

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

  //check if user exists
  const user = await c
    .get('orm')
    .query.users.findFirst({ where: eq(users.email, body.username) });

  if (!user) {
    return c.json({ ok: 'false', message: 'not found!' }, 404);
  }

  // check if password is correct
  try {
    const res = await compareHash(body.password, user.password);

    if (res) {
      const token = await sign({ username: body.username }, c.env.TOKEN_SECRET);
      return c.json({ ok: 'true', data: token });
    } else {
      return c.json(
        { ok: 'false', message: "username or password doesn't match" },
        403,
      );
    }
  } catch (e) {
    return c.json({ ok: 'false', message: 'server error' }, 500);
  }
});

app.get('/auth/me', (c) => {
  const payload = c.get('jwtPayload');

  return c.json(payload);
});

app.get('/users', async (c) => {
  const allUsers = await c.get('orm').query.users.findMany();

  return c.json(allUsers);
});

app.get('/users/:userId', async (c) => {
  const { userId } = c.req.param();

  if (Number.isNaN(+userId)) {
    return c.json({ message: 'bad request' }, 400);
  }

  const user = await c
    .get('orm')
    .query.users.findFirst({ where: eq(users.id, +userId) });

  if (!user) {
    return c.json({ message: 'user not found!' }, 404);
  }

  return c.json(user);
});

const insertUserRequest = insertUserSchema;
const insertUserResponse = selectUserSchema;

app.post('/users', vValidator('json', insertUserRequest), async (ctx) => {
  const data = ctx.req.valid('json');
  const user = await ctx
    .get('orm')
    .insert(users)
    .values(data)
    .returning()
    .get();
  return ctx.json(insertUserResponse._parse(user));
});

app.onError(async (err, c) => {
  console.log(err);
  return c.json('failed to serve');
});

export default app;
