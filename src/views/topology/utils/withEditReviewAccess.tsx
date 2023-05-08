import React from 'react';
import { observer } from 'mobx-react';

import { modelFor, referenceFor } from '@console/internal/module/k8s';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Node } from '@patternfly/react-topology';

import { getResource } from './topology-utils';

type ComponentProps = {
  element: Node;
};

export const withEditReviewAccess = (verb: K8sVerb) => (WrappedComponent: React.ComponentType) => {
  const Component: React.FC<ComponentProps> = (props) => {
    const resourceObj = getResource(props.element);
    const resourceModel = modelFor(referenceFor(resourceObj));
    const editAccess = useAccessReview({
      group: resourceModel.apiGroup,
      verb,
      resource: resourceModel.plural,
      name: resourceObj.metadata.name,
      namespace: resourceObj.metadata.namespace,
    });
    return <WrappedComponent {...(props as any)} canEdit={editAccess} />;
  };
  Component.displayName = `withEditReviewAccess(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;
  return observer(Component);
};
