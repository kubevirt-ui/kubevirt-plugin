/**
 * Replace existing direct properties of `T` with ones declared in `R`.
 */
export type ReplaceProperties<T, R> = {
  [K in keyof T]: K extends keyof R ? R[K] : T[K];
};
