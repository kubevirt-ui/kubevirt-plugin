import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import VirtualMachineStatus from '../../../../../../list/components/VirtualMachineStatus/VirtualMachineStatus';
import { VM_WORKLOAD_ANNOTATION } from '../../../../../../utils/constants';
import { getGPUDevices, getHostDevices } from '../../../../../../utils/selectors';
import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';
import MutedTextDiv from '../../MutedTextDiv/MutedTextDiv';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

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
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={<VirtualMachineStatus printableStatus={vm?.status?.printableStatus} />}
          descriptionHeader={t('Status')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.pod}
          descriptionHeader={t('Pod')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<BootOrderSummary vm={vm} />}
          descriptionHeader={t('Boot Order')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP Address')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.hostname}
          descriptionHeader={t('Hostname')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time Zone')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.node}
          descriptionHeader={t('Node')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextDiv text={t('Not available')} />
            )
          }
          descriptionHeader={t('Workload Profile')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.userCredentials}
          descriptionHeader={t('User credentials')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.sshAccess}
          descriptionHeader={t('SSH Access')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            <>
              <MutedTextDiv text={t(`${(gpus || []).length} GPU devices`)} />
              <MutedTextDiv text={t(`${(hostDevices || []).length} Host devices`)} />
            </>
          }
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
