import React from 'react';
import * as _ from 'lodash';

import { labelKeyForNodeKind } from '@console/shared';

import { OdcNodeModel } from '../../utils/types/topology-types';

import ApplicationGroupResource from './ApplicationGroupResource';

import './TopologyApplicationResources.scss';

type TopologyApplicationResourcesProps = {
  resources: OdcNodeModel[];
  group: string;
};

const TopologyApplicationResources: React.FC<TopologyApplicationResourcesProps> = ({
  resources,
  group,
}) => {
  const resourcesData = resources.reduce((acc, { resource }) => {
    if (resource?.kind) {
      acc[resource.kind] = [...(acc[resource.kind] ? acc[resource.kind] : []), resource];
    }
    return acc;
  }, {});

  return (
    <>
      {_.map(_.keys(resourcesData), (key) => (
        <ApplicationGroupResource
          key={`${group}-${key}`}
          title={labelKeyForNodeKind(key)}
          resourcesData={resourcesData[key]}
          group={group}
        />
      ))}
    </>
  );
};

export default TopologyApplicationResources;
