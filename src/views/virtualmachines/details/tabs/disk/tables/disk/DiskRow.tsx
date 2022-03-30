import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import DiskRowActions from './DiskRowActions';

const DiskRow: React.FC<RowProps<DiskRowDataLayout, { vm: V1VirtualMachine }>> = ({
  obj,
  activeColumnIDs,
  rowData: { vm },
}) => {
  const isPVCSource = ![CONTAINER_EPHERMAL, OTHER].includes(obj?.source);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {obj?.name} <HotplugLabel vm={vm} diskName={obj?.name} />
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
        <DiskRowActions vm={vm} diskName={obj?.name} pvcResourceExists={isPVCSource} />
      </TableData>
    </>
  );
};

export default DiskRow;

const HotplugLabel: React.FC<{ vm: V1VirtualMachine; diskName: string }> = ({ vm, diskName }) => {
  const { t } = useKubevirtTranslation();

  const hotplugText = React.useMemo(() => {
    const volume = getVolumes(vm)?.find((vol) => vol?.name === diskName);
    if (!volume) {
      return t('AutoDetach Hotplug');
    }
    if (volume?.persistentVolumeClaim?.hotpluggable || volume?.dataVolume?.hotpluggable) {
      return t('Persistent Hotplug');
    }
    return null;
  }, [diskName, t, vm]);

  if (!hotplugText) {
    return null;
  }

  return (
    <Label variant="filled" color="purple">
      {hotplugText}
    </Label>
  );
};
