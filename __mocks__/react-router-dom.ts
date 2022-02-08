module.exports = {
  ...(jest.requireActual('react-router-dom') as Record<string, any>),
  useLocation: () => ({
    pathname: 'localhost:3000',
    search: '',
  }),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
};
