import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
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
  vmDetailsRightGridObj: VirtualMachineDetailsRightGridLayoutPresentation;
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  vmDetailsRightGridObj,
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
        {vmDetailsRightGridObj?.pod}
      </DetailItem>
      <DetailItem key="bootOrder" title={t('Boot Order')}>
        <BootOrderSummary vm={vm} />
      </DetailItem>
      <DetailItem key="ipAddress" title={t('IP Address')}>
        {vmDetailsRightGridObj?.ipAddress}
      </DetailItem>
      <DetailItem key="hostname" title={t('Hostname')}>
        {vmDetailsRightGridObj?.hostname}
      </DetailItem>
      <DetailItem key="timezone" title={t('Time Zone')}>
        {vmDetailsRightGridObj?.timezone}
      </DetailItem>
      <DetailItem key="node" title={t('Node')}>
        {vmDetailsRightGridObj?.node}
      </DetailItem>
      <DetailItem key="workloadProfile" title={t('Workload Profile')}>
        {getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
          <MutedTextDiv text={t('Not available')} />
        )}
      </DetailItem>
      <DetailItem key="userCrediantials" title={t('User credentials')}>
        {vmDetailsRightGridObj?.userCredentials}
      </DetailItem>
      <DetailItem key="sshAccess" title={t('SSH Access')}>
        {vmDetailsRightGridObj?.sshAccess}
      </DetailItem>
      <DetailItem key="hardwareDevices" title={t('Hardware devices')}>
        <MutedTextDiv text={t(`${(gpus || []).length} GPU devices`)} />
        <MutedTextDiv text={t(`${(hostDevices || []).length} Host devices`)} />
      </DetailItem>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
