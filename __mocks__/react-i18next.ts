module.exports = {
  useTranslation: () => ({ t: (key) => key }),
  Trans: ({ children }) => children,
  getI18n: () => ({
    t: (string) => string,
  }),
};
