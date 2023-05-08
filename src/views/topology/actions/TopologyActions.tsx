import React, { FC, useMemo } from 'react';

import { ActionServiceProvider } from '@openshift-console/dynamic-plugin-sdk';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { GraphElement, observer } from '@patternfly/react-topology';

import ActionMenu from '../components/ActionMenu/ActionMenu';
import { getResource } from '../utils';

type TopologyActionsProps = {
  element: GraphElement;
};

const TopologyActions: FC<TopologyActionsProps> = ({ element }) => {
  const resource = getResource(element);
  const context = useMemo(() => {
    const { csvName } = element.getData()?.data ?? {};
    return {
      'topology-actions': element,
      'topology-context-actions': { element },
      ...(resource ? { [referenceFor(resource)]: resource } : {}),
      ...(csvName ? { 'csv-actions': { csvName, resource } } : {}),
    };
  }, [element, resource]);
  return (
    <ActionServiceProvider key={element.getId()} context={context}>
      {({ actions, options, loaded }) => {
        return (
          loaded && (
            <ActionMenu actions={actions} options={options} variant={ActionMenuVariant.DROPDOWN} />
          )
        );
      }}
    </ActionServiceProvider>
  );
};

export default observer(TopologyActions);
