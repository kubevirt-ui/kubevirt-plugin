module.exports = {
  ...(jest.requireActual('react-router-dom-v5-compat') as Record<string, any>),
  matchPath: () => null,
  useLocation: () => ({
    pathname: 'localhost:3000',
    search: 'query=',
  }),
  useMatch: () => ({
    params: {
      cluster: 'cluster',
      ns: 'default',
    },
  }),
  useNavigate: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: () => ({
    ns: 'default',
  }),
};
