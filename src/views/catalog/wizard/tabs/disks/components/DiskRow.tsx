import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Label } from '@patternfly/react-core';

import DiskRowActions from './DiskRowActions';

const DiskRow: React.FC<RowProps<DiskRowDataLayout>> = ({ activeColumnIDs, obj }) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['Container (Ephemeral)', 'Other', 'PVC (auto import)', 'URL'].includes(
    obj?.source,
  );
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Flex>
          <FlexItem>{obj?.name}</FlexItem>
          {obj?.isBootDisk && (
            <FlexItem>
              <Label color="blue" variant="filled">
                {t('bootable')}
              </Label>
            </FlexItem>
          )}
          {obj?.isEnvDisk && (
            <FlexItem>
              <Label color="blue" variant="filled">
                {t('environment disk')}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source">
        {isPVCSource ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.source}
            namespace={obj?.namespace}
          />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        {readableSizeUnit(obj?.size)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        {obj?.drive}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        {obj?.interface}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class">
        {obj?.storageClass}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
        id=""
      >
        <DiskRowActions diskName={obj?.name} />
      </TableData>
    </>
  );
};

export default DiskRow;
