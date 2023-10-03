import bcrypt from 'bcryptjs';

const saltRounds = 10;

// export const getHash = (myPlaintextPassword: string): Promise<string> => {
//   // use bcrypt
//   return Bun.password.hash(myPlaintextPassword, {
//     algorithm: 'bcrypt',
//     cost: saltRounds, // number between 4-31
//   });
// };

// export const compareHash = (
//   myPlaintextPassword: string,
//   hash: string,
// ): Promise<boolean | string> => {
//   return Bun.password.verify(myPlaintextPassword, hash, 'bcrypt');
// };

export const getHash = (myPlaintextPassword: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        reject(err);
      }
      bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

export const compareHash = (
  myPlaintextPassword: string,
  hash: string,
): Promise<boolean | string> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
      if (err) {
        reject(err);
      }

      resolve(result);
    });
  });
};

// getHash('sample').then((res) => console.log(res));

// compareHash(
//   'sample',
//   '$2b$10$HEvYaNCpujadmN70Wld0Cu1JfAKZONC1T8Mr/kotWkimBYwIjMWi6',
// ).then((res) => console.log(res));
