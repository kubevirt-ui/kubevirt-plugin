declare module 'react-redux' {
  import type { ComponentType } from 'react';
  import type { Dispatch, Action } from 'redux';

  export function connect<
    TStateProps = Record<string, unknown>,
    TOwnProps = Record<string, unknown>,
  >(
    mapStateToProps?: (state: any, ownProps?: TOwnProps) => TStateProps,
    mapDispatchToProps?: any,
  ): (component: ComponentType<any>) => ComponentType<TOwnProps>;

  export function useDispatch<TDispatch extends Dispatch<Action> = Dispatch<Action>>(): TDispatch;

  export function useSelector<TState = unknown, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
  ): TSelected;
}
