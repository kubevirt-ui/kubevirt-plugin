type Next = (action: unknown) => unknown;

const thunkMiddleware =
  () =>
  (next: Next): Next =>
  (action) =>
    next(action);

export default thunkMiddleware;
