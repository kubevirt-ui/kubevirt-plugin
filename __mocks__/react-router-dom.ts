module.exports = {
  ...(jest.requireActual('react-router-dom') as Record<string, any>),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useLocation: () => ({
    pathname: 'localhost:3000',
    search: 'query=',
  }),
};
