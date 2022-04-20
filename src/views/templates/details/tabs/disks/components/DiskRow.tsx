import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import TemplateNameTableData from '@kubevirt-utils/components/TemplateNameTableData/TemplateNameTableData';
import DiskRowActions from './DiskRowActions';

const DiskRow: React.FC<
  RowProps<
    DiskRowDataLayout,
    { vm: V1VirtualMachine; onUpdate: (vm: V1VirtualMachine) => Promise<void> }
  >
> = ({ obj, activeColumnIDs, rowData: { vm, onUpdate } }) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['Container (Ephemeral)', 'Other'].includes(obj?.source);
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <TemplateNameTableData name={obj?.name}>
          <Split hasGutter>
            <SplitItem>{obj?.name}</SplitItem>
            {obj?.isBootDisk && (
              <SplitItem>
                <Label variant="filled" color="blue">
                  {t('bootable')}
                </Label>
              </SplitItem>
            )}
          </Split>
        </TemplateNameTableData>
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink kind={PersistentVolumeClaimModel.kind} name={obj?.source} />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {obj?.size}
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
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <DiskRowActions diskName={obj?.name} onUpdate={onUpdate} vm={vm} />
      </TableData>
    </>
  );
};

export default DiskRow;
