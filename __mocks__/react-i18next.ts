module.exports = {
  getI18n: () => ({
    t: (string) => string,
  }),
  Trans: ({ children }) => children,
  useTranslation: () => ({ t: (key) => key }),
};
