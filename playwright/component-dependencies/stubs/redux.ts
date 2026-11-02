/**
 * Minimal `redux` store stub for gallery bundles (createStore + combineReducers only).
 */
export type AnyAction = { type: string };

export type Reducer<S = unknown, A = AnyAction> = (state: S | undefined, action: A) => S;

export type Store<S = unknown> = {
  dispatch: (action: AnyAction) => AnyAction;
  getState: () => S;
  subscribe: (listener: () => void) => () => void;
};

export const createStore = <S>(reducer: Reducer<S>): Store<S> => {
  let state = reducer(undefined, { type: '@@INIT' });
  const listeners = new Set<() => void>();
  return {
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach((l) => l());
      return action;
    },
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const combineReducers = <S>(reducers: Record<string, Reducer>): Reducer<S> => {
  return (state = {} as S, action) => {
    const next = { ...state } as Record<string, unknown>;
    for (const key of Object.keys(reducers)) {
      next[key] = reducers[key]((state as Record<string, unknown>)[key], action);
    }
    return next as S;
  };
};
