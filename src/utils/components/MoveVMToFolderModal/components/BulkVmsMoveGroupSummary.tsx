import type { FC } from 'react';
import { Trans } from 'react-i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import VmCountPopoverLink from './VmCountPopoverLink';

type BulkVmsMoveGroupSummaryProps = {
  destinationGroupName: string;
  hasDestinationChanged: boolean;
  namespace: string;
  sourceGroupName?: string;
  vms: V1VirtualMachine[];
};

const BulkVmsMoveGroupSummary: FC<BulkVmsMoveGroupSummaryProps> = ({
  destinationGroupName,
  hasDestinationChanged,
  namespace,
  sourceGroupName,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const showGroupChange = hasDestinationChanged && Boolean(sourceGroupName);

  if (!showGroupChange) {
    return (
      <Trans t={t}>
        Move <VmCountPopoverLink vms={vms} /> in namespace <strong>{{ namespace }}</strong>
      </Trans>
    );
  }

  return (
    <Trans t={t}>
      Move <VmCountPopoverLink vms={vms} /> in namespace <strong>{{ namespace }}</strong> from group
      &quot;<strong>{{ sourceGroupName }}</strong>&quot; to group &quot;
      <strong>{{ destinationGroupName }}</strong>&quot;
    </Trans>
  );
};

export default BulkVmsMoveGroupSummary;
