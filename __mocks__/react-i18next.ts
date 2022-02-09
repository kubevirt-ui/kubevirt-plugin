module.exports = {
  useTranslation: () => ({ t: (key) => key }),
  Trans: ({ children }) => children,
};
