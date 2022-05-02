export const generateTestName = (length = 5) => {
  const prefix = 'cytest-'.concat((+new Date() * Math.random()).toString(36).substring(0, length));
  return prefix;
};
