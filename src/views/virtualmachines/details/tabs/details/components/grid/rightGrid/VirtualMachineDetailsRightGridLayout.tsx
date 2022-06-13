import * as React from 'react';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SSHAccessModal from '@kubevirt-utils/components/SSHAccess/SSHAccessModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import VirtualMachineStatus from '../../../../../../list/components/VirtualMachineStatus/VirtualMachineStatus';
import { VirtualMachineDetailsRightGridLayoutPresentation } from '../../../utils/gridHelper';
import BootOrderSummary from '../../BootOrderSummary/BootOrderSummary';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type VirtualMachineDetailsRightGridLayout = {
  vm: V1VirtualMachine;
  vmDetailsRightGridObj: VirtualMachineDetailsRightGridLayoutPresentation;
  sshService?: IoK8sApiCoreV1Service;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineDetailsRightGridLayout: React.FC<VirtualMachineDetailsRightGridLayout> = ({
  vm,
  sshService,
  vmDetailsRightGridObj,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [canGetNode] = useAccessReview({
    namespace: vmi?.metadata?.namespace,
    verb: 'get' as K8sVerb,
    resource: NodeModel.plural,
  });

  const onSubmit = React.useCallback(
    (obj: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: obj,
        ns: obj.metadata.namespace,
        name: obj.metadata.name,
      }),
    [],
  );
  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={<VirtualMachineStatus printableStatus={vm?.status?.printableStatus} />}
          descriptionHeader={t('Status')}
          data-test-id={`${vm?.metadata?.name}-status`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.pod}
          descriptionHeader={t('Pod')}
          data-test-id={`${vm?.metadata?.name}-pod`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.vmi}
          descriptionHeader={t('VirtualMachineInstance')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<BootOrderSummary vm={vm} />}
          descriptionHeader={t('Boot Order')}
          isEdit
          showEditOnTitle
          onEditClick={() =>
            createModal((props) => (
              <BootOrderModal {...props} vm={vm} onSubmit={onSubmit} vmi={vmi} />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-order`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.ipAddress}
          descriptionHeader={t('IP Address')}
          data-test-id={`${vm?.metadata?.name}-ip-address`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.hostname}
          descriptionHeader={t('Hostname')}
          data-test-id={`${vm?.metadata?.name}-hostname`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.timezone}
          descriptionHeader={t('Time Zone')}
          data-test-id={`${vm?.metadata?.name}-timezone`}
        />
        {canGetNode && (
          <VirtualMachineDescriptionItem
            descriptionData={vmDetailsRightGridObj?.node}
            descriptionHeader={t('Node')}
          />
        )}
        <VirtualMachineDescriptionItem
          descriptionData={
            getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) || (
              <MutedTextSpan text={t('Not available')} />
            )
          }
          descriptionHeader={t('Workload Profile')}
          data-test-id={`${vm?.metadata?.name}-workload-profile`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.userCredentials}
          descriptionHeader={t('User credentials')}
          data-test-id={`${vm?.metadata?.name}-user-credentials`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={vmDetailsRightGridObj?.sshAccess}
          isEdit={!!vmi}
          showEditOnTitle
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SSHAccessModal
                vm={vm}
                vmi={vmi}
                isOpen={isOpen}
                onClose={onClose}
                sshService={sshService}
              />
            ))
          }
          descriptionHeader={t('SSH Access')}
          data-test-id={`${vm?.metadata?.name}-ssh-access`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<HardwareDevices vm={vm} canEdit onSubmit={onSubmit} />}
          descriptionHeader={t('Hardware devices')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsRightGridLayout;
