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
  actionsDisabled: boolean;
  onUpdate: (vm: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const DiskRow: React.FC<RowProps<DiskRowDataLayout, AdditionalRowData>> = ({
  activeColumnIDs,
  obj,
  rowData: { actionsDisabled, onUpdate, vm },
}) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['Container (Ephemeral)', 'Other', 'PVC (auto import)', 'URL'].includes(
    obj?.source,
  );

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <TemplateValue value={obj?.name}>
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
        </TemplateValue>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source">
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
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        <TemplateValue value={readableSizeUnit(obj?.size)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        <TemplateValue value={obj?.drive} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        <TemplateValue value={obj?.interface} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class">
        <TemplateValue value={obj?.storageClass} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <DiskRowActions
          diskName={obj?.name}
          isDisabled={actionsDisabled}
          onUpdate={onUpdate}
          vm={vm}
        />
      </TableData>
    </>
  );
};

export default DiskRow;
