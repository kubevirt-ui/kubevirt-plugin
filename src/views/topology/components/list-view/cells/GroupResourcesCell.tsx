import React from 'react';

import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import { ResourceIcon } from '@console/internal/components/hooks';
import { isValidUrl, labelForNodeKind } from '@console/shared';
import { DataListCell } from '@patternfly/react-core';
import { Node, observer } from '@patternfly/react-topology';

import { showKind, useDisplayFilters } from '../../../filters';

interface GroupResourcesCellProps {
  group: Node;
}

const GroupResourcesCell: React.FC<GroupResourcesCellProps> = ({ group }) => {
  const displayFilters = useDisplayFilters();
  const { groupResources } = group.getData();
  const shownResources = groupResources.filter((res) =>
    showKind(res.resourceKind || res.resource?.kind, displayFilters),
  );

  const childKindsMap = shownResources.reduce((acc, child) => {
    const kind = child.resourceKind || child.resource?.kind;
    if (!acc[kind]) {
      acc[kind] = 0;
    }
    acc[kind]++;
    return acc;
  }, {});
  const kindKeys = Object.keys(childKindsMap).sort((a, b) =>
    labelForNodeKind(a).localeCompare(labelForNodeKind(b)),
  );
  return (
    <DataListCell key="resources" id={`${group.getId()}_resources`}>
      {kindKeys.map((key) => {
        let itemIcon;
        let imageClass;
        if (imageClass) {
          itemIcon = (
            <image
              className="co-m-resource-icon--md"
              xlinkHref={isValidUrl(imageClass) ? imageClass : getImageForIconClass(imageClass)}
            />
          );
        } else {
          itemIcon = <ResourceIcon className="co-m-resource-icon--md" kind={key} />;
        }
        return (
          <span key={key} className="odc-topology-list-view__group-resource-count">
            {childKindsMap[key]}
            {itemIcon}
          </span>
        );
      })}
    </DataListCell>
  );
};

export default observer(GroupResourcesCell);
