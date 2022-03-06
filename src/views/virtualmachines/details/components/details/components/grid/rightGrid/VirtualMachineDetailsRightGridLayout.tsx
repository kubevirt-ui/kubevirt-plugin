import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/selectors';
import { DetailItem } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GridItem } from '@patternfly/react-core';

import VirtualMachineStatus from '../../../../../../list/components/VirtualMachineStatus/VirtualMachineStatus';
import { VM_WORKLOAD_ANNOTATION } from '../../../../../../utils/constants';
import { getGPUDevices, getHostDevices } from '../../../../../../utils/selectors';
import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';
import MutedTextDiv from '../../MutedTextDiv/MutedTextDiv';

type VirtualMachineDetailsRightGridLayout = {
  vm: V1VirtualMachine;
  obj: VirtualMachineDetailsRightGridLayoutPresentation;
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  obj,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const hostDevices = getHostDevices(vm);
  const gpus = getGPUDevices(vm);
  return (
    <GridItem span={5}>
      <DetailItem key="status" title={t('Status')}>
        <VirtualMachineStatus printableStatus={vm?.status?.printableStatus} />
      </DetailItem>
      <DetailItem key="pod" title={t('Pod')}>
        {obj?.pod}
      </DetailItem>
      <DetailItem key="bootOrder" title={t('Boot Order')}>
        <BootOrderSummary vm={vm} />
      </DetailItem>
      <DetailItem key="ipAddress" title={t('IP Address')}>
        {obj?.ipAddress}
      </DetailItem>
      <DetailItem key="hostname" title={t('Hostname')}>
        {obj?.hostname}
      </DetailItem>
      <DetailItem key="timezone" title={t('Time Zone')}>
        {obj?.timezone}
      </DetailItem>
      <DetailItem key="node" title={t('Node')}>
        {obj?.node}
      </DetailItem>
      <DetailItem key="workloadProfile" title={t('Workload Profile')}>
        {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
          <MutedTextDiv text={t('Not available')} />
        )}
      </DetailItem>
      <DetailItem key="userCrediantials" title={t('User credentials')}>
        {obj?.userCredentials}
      </DetailItem>
      <DetailItem key="sshAccess" title={t('SSH Access')}>
        {obj?.sshAccess}
      </DetailItem>
      <DetailItem key="hardwareDevices" title={t('Hardware devices')}>
        <MutedTextDiv text={t(`${(gpus || []).length} GPU devices`)} />
        <MutedTextDiv text={t(`${(hostDevices || []).length} Host devices`)} />
      </DetailItem>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
