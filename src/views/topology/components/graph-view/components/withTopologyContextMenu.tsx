import React from 'react';
import { observer } from 'mobx-react';

import { ActionContext, ActionServiceProvider } from '@console/shared';
import { ContextMenu, ElementContext, GraphElement } from '@patternfly/react-topology';

import { createContextMenuItems } from '../../../actions';

type Reference = React.ComponentProps<typeof ContextMenu>['reference'];

export interface WithContextMenuProps {
  onContextMenu: (e: React.MouseEvent) => void;
  contextMenuOpen: boolean;
}

const withContextMenu =
  <E extends GraphElement>(
    actionContext: (element: E) => ActionContext,
    container?: Element | null | undefined | (() => Element),
    className?: string,
    atPoint = true,
  ) =>
  <P extends WithContextMenuProps>(WrappedComponent: React.ComponentType<P>) => {
    const Component: React.FC<Omit<P, keyof WithContextMenuProps>> = (props) => {
      const element = React.useContext(ElementContext);
      const [reference, setReference] = React.useState<Reference | null>(null);
      const onContextMenu = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setReference(
          atPoint
            ? {
                x: e.pageX,
                y: e.pageY,
              }
            : e.currentTarget,
        );
      }, []);

      return (
        <>
          <WrappedComponent
            {...(props as any)}
            onContextMenu={onContextMenu}
            contextMenuOpen={!!reference}
          />
          {reference ? (
            <ActionServiceProvider context={actionContext(element as E)}>
              {({ options, loaded }) =>
                loaded ? (
                  <ContextMenu
                    reference={reference}
                    container={container}
                    className={className}
                    open
                    onRequestClose={() => setReference(null)}
                  >
                    {createContextMenuItems(options)}
                  </ContextMenu>
                ) : null
              }
            </ActionServiceProvider>
          ) : null}
        </>
      );
    };
    Component.displayName = `withContextMenu(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;
    return observer(Component);
  };

export default withContextMenu;
