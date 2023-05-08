import React from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';

type TopologyApplicationResourceListProps = {
  resources: K8sResourceKind[];
};

const TopologyApplicationResourceList: React.FC<TopologyApplicationResourceListProps> = ({
  resources,
}) => {
  return (
    <ul className="list-group">
      {resources?.map((resource) => {
        const {
          metadata: { name, namespace, uid },
        } = resource;
        return (
          <li className="list-group-item  container-fluid" key={uid}>
            <ResourceLink kind={referenceFor(resource)} name={name} namespace={namespace} />
          </li>
        );
      })}
    </ul>
  );
};

export default TopologyApplicationResourceList;
