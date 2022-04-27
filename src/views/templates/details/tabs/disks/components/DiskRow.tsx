import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';

import DiskRowActions from './DiskRowActions';

type AdditionalRowData = {
  vm: V1VirtualMachine;
  onUpdate: (vm: V1VirtualMachine) => Promise<void>;
  actionsDisabled: boolean;
};

const DiskRow: React.FC<RowProps<DiskRowDataLayout, AdditionalRowData>> = ({
  obj,
  activeColumnIDs,
  rowData: { vm, onUpdate, actionsDisabled },
}) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['Container (Ephemeral)', 'Other'].includes(obj?.source);
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.name}>
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
        </TemplateValue>
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink kind={PersistentVolumeClaimModel.kind} name={obj?.source} />
        ) : (
          <TemplateValue value={obj?.source} />
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.size} />
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.drive} />
      </TableData>
      <TableData id="interface" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.interface} />
      </TableData>
      <TableData id="storage-class" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.storageClass} />
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <DiskRowActions
          diskName={obj?.name}
          onUpdate={onUpdate}
          vm={vm}
          isDisabled={actionsDisabled}
        />
      </TableData>
    </>
  );
};

export default DiskRow;
