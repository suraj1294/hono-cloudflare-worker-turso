import { createClient } from '@libsql/client';
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';

function getDbInstance() {
  let DBInstance: LibSQLDatabase;

  return function initiateDB(url = '', authToken = '') {
    if (!DBInstance) {
      console.log('new Instance');
      DBInstance = drizzle(
        createClient({
          url,
          authToken,
        }),
      );

      return DBInstance;
    }

    return DBInstance;
  };
}

export default getDbInstance();
