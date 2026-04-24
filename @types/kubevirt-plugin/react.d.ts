import 'react';

declare module 'react' {
  /**
   * React 18 `FC` type no longer supports optional `children` so we use a custom `FCC` type
   * (functional component with children) as a temporary workaround.
   *
   * TODO: Remove this type once all React components have their prop types updated according
   * to expected `children` usage.
   *
   * @deprecated Update component prop type to reflect expected `children` usage.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type FCC<P = {}> = FC<PropsWithChildren<P>>;
}
