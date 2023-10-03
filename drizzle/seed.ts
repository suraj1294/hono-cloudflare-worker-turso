import { isUserValid, users } from './schema';
import { faker } from '@faker-js/faker';
import { db } from './migrate';
import { getHash } from '../src/utils/encryption';

type User = typeof isUserValid;

const genPassCodeHash = async (params: string[]) =>
  Promise.all(params.map((p) => getHash(p)));

async function seed() {
  const passcodes = ['use1', 'use2', 'use3', 'use4'];

  const hashes = await genPassCodeHash(passcodes);

  const usersData: User[] = [
    {
      id: 2000,
      name: faker.person.firstName('male'),
      email: faker.internet.email(),
      role: 'user',
      password: hashes[0],
    },
    {
      id: 2001,
      name: faker.person.firstName('female'),
      email: faker.internet.email(),
      role: 'user',
      password: hashes[1],
    },

    {
      id: 2002,
      name: faker.person.firstName('female'),
      email: faker.internet.email(),
      role: 'user',
      password: hashes[2],
    },
    {
      id: 2003,
      name: faker.person.firstName('male'),
      email: faker.internet.email(),
      role: 'user',
      password: hashes[3],
    },
  ];

  const deleted = await db.delete(users).returning();

  console.log(`deleted ${deleted.length} categories!`);

  const storedCategories: any = await db
    .insert(users)
    .values(usersData)
    .returning()
    .all();

  console.log(`Inserted ${storedCategories.length} categories!`);

  process.exit(0);
}

seed();
