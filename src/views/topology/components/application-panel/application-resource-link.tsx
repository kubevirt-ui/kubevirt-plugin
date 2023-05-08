import React from 'react';

import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import { TYPE_APPLICATION_GROUP } from '../../const';

export const getApplicationPanelResourceLink = (element: GraphElement) => {
  if (element.getType() !== TYPE_APPLICATION_GROUP) return undefined;
  return (
    <>
      <ResourceIcon className="co-m-resource-icon--lg" kind="application" />
      {element.getLabel()}
    </>
  );
};
