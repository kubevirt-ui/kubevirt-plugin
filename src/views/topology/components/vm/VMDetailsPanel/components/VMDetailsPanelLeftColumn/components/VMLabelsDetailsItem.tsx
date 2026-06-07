import React, { FC, useCallback } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { EditLabelsModal } from '@kubevirt-utils/components/MetadataModal/EditLabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getLabels } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { updateLabels } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMLabelsDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMLabelsDetailsItem: FC<VMLabelsDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'patch' as K8sVerb);
  const [canUpdateVM] = useFleetAccessReview(accessReview || {});

  const onEditClick = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <EditLabelsModal
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
          onLabelsSubmit={(labels) => updateLabels(vm, labels)}
        />
      )),
    [createModal, vm],
  );

  return (
    <DescriptionItem
      descriptionData={
        <MetadataLabels
          cluster={getCluster(vm)}
          labels={getLabels(vm)}
          model={VirtualMachineModel}
        />
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={<SearchItem id="labels">{t('Labels')}</SearchItem>}
      isEdit={canUpdateVM}
      isLabelEditor
      onEditClick={onEditClick}
      showEditOnTitle
    />
  );
};

export default VMLabelsDetailsItem;
