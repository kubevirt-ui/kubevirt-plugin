import type { FC } from 'react';
import { Trans } from 'react-i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';

type SingleVmMoveGroupSummaryProps = {
  destinationGroupName: string;
  hasDestinationChanged: boolean;
  namespace: string;
  sourceGroupName: string;
  vm: V1VirtualMachine;
};

const SingleVmMoveGroupSummary: FC<SingleVmMoveGroupSummaryProps> = ({
  destinationGroupName,
  hasDestinationChanged,
  namespace,
  sourceGroupName,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const vmName = getName(vm);

  if (!hasDestinationChanged) {
    return (
      <Trans t={t}>
        Move <strong>{{ vmName }}</strong> VirtualMachine in namespace{' '}
        <strong>{{ namespace }}</strong>
      </Trans>
    );
  }

  return (
    <Trans t={t}>
      Move <strong>{{ vmName }}</strong> VirtualMachine in namespace{' '}
      <strong>{{ namespace }}</strong> from group &quot;<strong>{{ sourceGroupName }}</strong>&quot;
      to group &quot;
      <strong>{{ destinationGroupName }}</strong>&quot;
    </Trans>
  );
};

export default SingleVmMoveGroupSummary;
