export const generateTestName = (length = 5) => {
  const prefix = 'cytest-';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * 27);
    randomString = randomString.concat(String.fromCharCode(97 + random));
  }

  return prefix.concat(randomString);
};
