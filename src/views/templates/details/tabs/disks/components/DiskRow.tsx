import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Label } from '@patternfly/react-core';

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
  const isPVCSource = !['URL', 'PVC (auto import)', 'Container (Ephemeral)', 'Other'].includes(
    obj?.source,
  );

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={obj?.name}>
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
        </TemplateValue>
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.source}
            namespace={obj?.namespace}
          />
        ) : (
          <TemplateValue value={obj?.source} />
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        <TemplateValue value={readableSizeUnit(obj?.size)} />
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
        id=""
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
