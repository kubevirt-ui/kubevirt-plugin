module.exports = {
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
  useNavigate: () => jest.fn(),
  useParams: () => ({
    ns: 'default',
  }),
};
