import type { ComponentType } from 'react';

const noopDispatch = (): void => undefined;

export const useDispatch = (): typeof noopDispatch => noopDispatch;

type Connectable = ComponentType<Record<string, unknown>>;

export const connect =
  (_mapStateToProps?: unknown, _mapDispatchToProps?: unknown) =>
  (Component: Connectable): Connectable =>
    Component;

export const useSelector = <T>(selector: (state: unknown) => T): T => selector({});
