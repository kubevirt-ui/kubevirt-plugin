module.exports = {
  ...(jest.requireActual('react-router-dom-v5-compat') as Record<string, any>),
  useLocation: () => ({
    pathname: 'localhost:3000',
    search: 'query=',
  }),
  useNavigate: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
};
