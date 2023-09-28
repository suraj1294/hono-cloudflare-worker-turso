import { createClient } from '@libsql/client';
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';

function getDbInstance() {
  let DBInstance: LibSQLDatabase;

  return function initiateDB(url = '', authToken = '') {
    if (!DBInstance) {
      console.log('new Instance');
      try {
        DBInstance = drizzle(
          createClient({
            url,
            authToken,
          }),
        );
      } catch (e) {
        console.log('failed to connect to database');
      }

      return DBInstance;
    }

    return DBInstance;
  };
}

export default getDbInstance();
