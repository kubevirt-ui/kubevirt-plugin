import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1VirtualMachineClone, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { Form, ModalVariant } from '@patternfly/react-core';

import CloningStatus from './components/CloningStatus';
import ConfigurationSummary from './components/ConfigurationSummary';
import NameInput from './components/NameInput';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox';
import { CLONING_STATUSES } from './utils/constants';
import { cloneVM, runVM, vmExist } from './utils/helpers';

type CloneVMModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const [cloneName, setCloneName] = useState(
    `${vm?.metadata?.name}-clone-${getRandomChars()}`.substring(0, MAX_K8S_NAME_LENGTH),
  );

  const [vmCloneRequest, setVMCloneRequest] = useState<V1alpha1VirtualMachineClone>();
  const [cloning, setCloning] = useState(false);
  const [startCloneVM, setStartCloneVM] = useState(false);

  const onClone = async () => {
    const vmSameName = await vmExist(cloneName, vm.metadata.namespace);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    const request = await cloneVM(vm.metadata.name, cloneName, vm.metadata.namespace);

    setCloning(true);
    setVMCloneRequest(request);
  };

  const onComplete = (status: CLONING_STATUSES) => {
    if (status === CLONING_STATUSES.SUCCEEDED) {
      startCloneVM && runVM(cloneName, vm?.metadata?.namespace);

      history.push(`/k8s/ns/${vm.metadata.namespace}/${VirtualMachineModelRef}/${cloneName}`);

      onClose();
    }

    setCloning(false);
  };

  return (
    <TabModal
      closeOnSubmit={false}
      headerText={t('Clone VirtualMachine')}
      isDisabled={cloning}
      isLoading={cloning}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      obj={vm}
      onClose={onClose}
      onSubmit={onClone}
      submitBtnText={t('Clone')}
    >
      <Form className="pf-u-w-75-on-md pf-u-w-66-on-lg pf-u-m-auto" isHorizontal>
        <NameInput name={cloneName} setName={setCloneName} />
        <StartClonedVMCheckbox setStartCloneVM={setStartCloneVM} startCloneVM={startCloneVM} />
        <ConfigurationSummary vm={vm} />
        {cloning && <CloningStatus onComplete={onComplete} vmCloneRequest={vmCloneRequest} />}
      </Form>
    </TabModal>
  );
};

export default CloneVMModal;
