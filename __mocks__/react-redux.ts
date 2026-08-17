/* eslint-disable */
module.exports = {
  connect: () => (component) => component,
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector({}),
};
