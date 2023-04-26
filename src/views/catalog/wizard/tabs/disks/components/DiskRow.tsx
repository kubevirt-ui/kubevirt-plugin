import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Label } from '@patternfly/react-core';

import DiskRowActions from './DiskRowActions';

const DiskRow: React.FC<RowProps<DiskRowDataLayout>> = ({ obj, activeColumnIDs }) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['URL', 'PVC (auto import)', 'Container (Ephemeral)', 'Other'].includes(
    obj?.source,
  );
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <Flex>
          <FlexItem>{obj?.name}</FlexItem>
          {obj?.isBootDisk && (
            <FlexItem>
              <Label variant="filled" color="blue">
                {t('bootable')}
              </Label>
            </FlexItem>
          )}
          {obj?.isEnvDisk && (
            <FlexItem>
              <Label variant="filled" color="blue">
                {t('environment disk')}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
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
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {readableSizeUnit(obj?.size)}
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        {obj?.drive}
      </TableData>
      <TableData id="interface" activeColumnIDs={activeColumnIDs}>
        {obj?.interface}
      </TableData>
      <TableData id="storage-class" activeColumnIDs={activeColumnIDs}>
        {obj?.storageClass}
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <DiskRowActions diskName={obj?.name} />
      </TableData>
    </>
  );
};

export default DiskRow;
