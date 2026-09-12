declare module 'react-redux' {
  import type { ComponentType } from 'react';
  import type { Action, Dispatch } from 'redux';

  export function connect<
    TStateProps = Record<string, unknown>,
    TOwnProps = Record<string, unknown>,
  >(
    mapStateToProps?: (state: unknown, ownProps?: TOwnProps) => TStateProps,
    mapDispatchToProps?: unknown,
  ): (component: ComponentType<TOwnProps & TStateProps>) => ComponentType<TOwnProps>;

  export function useDispatch<TDispatch extends Dispatch<Action> = Dispatch<Action>>(): TDispatch;

  export function useSelector<TState = unknown, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
  ): TSelected;
}
