import { v4 as uuidv4 } from 'uuid';
import { isUserValid, users } from './schema';
import { faker } from '@faker-js/faker';
import { db } from './migrate';

type User = typeof isUserValid;

async function seed() {
  const usersData: User[] = [
    {
      id: 2000,
      name: faker.person.firstName('male'),
      email: faker.internet.email(),
      role: 'user',
    },
    {
      id: 2001,
      name: faker.person.firstName('female'),
      email: faker.internet.email(),
      role: 'user',
    },

    {
      id: 2002,
      name: faker.person.firstName('female'),
      email: faker.internet.email(),
      role: 'user',
    },
    {
      id: 2003,
      name: faker.person.firstName('male'),
      email: faker.internet.email(),
      role: 'user',
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
