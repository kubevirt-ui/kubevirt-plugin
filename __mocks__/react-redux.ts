/* eslint-disable @eslint-react/no-unnecessary-use-prefix */
module.exports = {
  connect: () => (component) => component,
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector({}),
};
