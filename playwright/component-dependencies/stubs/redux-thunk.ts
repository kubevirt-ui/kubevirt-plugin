/**
 * Pass-through `redux-thunk` middleware stub (no async action handling in gallery).
 */
type Next = (action: unknown) => unknown;

const thunkMiddleware =
  () =>
  (next: Next): Next =>
  (action) =>
    next(action);

export default thunkMiddleware;
