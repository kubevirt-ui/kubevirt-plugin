import * as React from 'react';

import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

const DiskRow: React.FC<RowProps<DiskRowDataLayout, { vmVolumes: V1Volume[] }>> = ({
  obj,
  activeColumnIDs,
  rowData: { vmVolumes },
}) => {
  const { t } = useKubevirtTranslation();
  const isPVCSource = !['Container (Ephemeral)', 'Other'].includes(obj?.source);
  const HotplugLabel = React.useMemo(() => {
    const volume = vmVolumes?.find((vol) => vol.name === obj?.name);
    let hotplugLabel: string = null;
    if (!volume) {
      hotplugLabel = t('AutoDetach Hotplug');
    }
    if (volume?.persistentVolumeClaim?.hotpluggable || volume?.dataVolume?.hotpluggable) {
      hotplugLabel = t('Persistent Hotplug');
    }
    return hotplugLabel ? (
      <Label variant="filled" color="purple">
        {hotplugLabel}
      </Label>
    ) : (
      hotplugLabel
    );
  }, [obj, vmVolumes, t]);
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {obj?.name} {HotplugLabel}
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
        ...
      </TableData>
    </>
  );
};

export default DiskRow;
