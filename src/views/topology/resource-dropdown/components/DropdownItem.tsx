import React, { FC } from 'react';

import {
  getGroupVersionKindForModel,
  K8sKind,
  ResourceIcon,
} from '@openshift-console/dynamic-plugin-sdk';

type DropdownItemProps = {
  model: K8sKind;
  name: string;
  namespace?: string;
};

const DropdownItem: FC<DropdownItemProps> = ({ model, name, namespace }) => (
  <span className="co-resource-item">
    <span className="co-resource-icon--fixed-width">
      <ResourceIcon groupVersionKind={getGroupVersionKindForModel(model)} />
    </span>
    <span className="co-resource-item__resource-name">
      <span>{name}</span>
      {namespace && (
        <div className="text-muted co-truncate co-nowrap small co-resource-item__resource-namespace">
          {namespace}
        </div>
      )}
    </span>
  </span>
);

export default DropdownItem;
