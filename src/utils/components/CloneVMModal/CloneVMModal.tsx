import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { Form, ModalVariant } from '@patternfly/react-core';

import CloningStatus from './components/CloningStatus';
import ConfigurationSummary from './components/ConfigurationSummary';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import useCloneVMModal from './hooks/useCloneVMModal';
import { CLONING_STATUSES } from './utils/constants';
import { cloneVM, runVM, vmExist } from './utils/helpers';

type CloneVMModalProps = {
  headerText?: string;
  isOpen: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ headerText, isOpen, onClose, source }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = source?.metadata?.namespace;

  const [cloneName, setCloneName] = useState(
    `${source?.metadata?.name}${isVM(source) ? '-clone-' : '-'}${getRandomChars()}`.substring(
      0,
      MAX_K8S_NAME_LENGTH,
    ),
  );

  const vmUseRunning = useMemo(
    () =>
      (source as V1VirtualMachine)?.spec?.running !== undefined &&
      (source as V1VirtualMachine)?.spec?.running !== null,
    [source],
  );

  const [startCloneVM, setStartCloneVM] = useState(false);

  const [initialCloneRequest, setInitialCloneRequest] = useState<V1beta1VirtualMachineClone>();

  const sendCloneRequest = async () => {
    const vmSameName = await vmExist(cloneName, namespace, source?.cluster);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    const request = await cloneVM(source, cloneName, namespace);

    setInitialCloneRequest(request);
  };

  const cloneRequest = useCloneVMModal(
    initialCloneRequest?.metadata?.name,
    initialCloneRequest?.metadata?.namespace,
    source?.cluster,
  );

  useEffect(() => {
    if (cloneRequest?.status?.phase === CLONING_STATUSES.SUCCEEDED) {
      startCloneVM && runVM(cloneName, namespace, source?.cluster, vmUseRunning);

      onClose();

      if (cloneRequest?.cluster) {
        navigate(
          `/multicloud/infrastructure/virtualmachines/${cloneRequest?.cluster}/${getNamespace(
            cloneRequest,
          )}/${cloneName}`,
        );
        return;
      }

      navigate(`/k8s/ns/${namespace}/${VirtualMachineModelRef}/${cloneName}`);
    }
  }, [cloneRequest, startCloneVM, cloneName, namespace, onClose, navigate, vmUseRunning, source]);

  return (
    <TabModal
      closeOnSubmit={false}
      headerText={headerText ?? t('Clone {{sourceKind}}', { sourceKind: source.kind })}
      isDisabled={Boolean(initialCloneRequest)}
      isLoading={Boolean(initialCloneRequest)}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      obj={source}
      onClose={onClose}
      onSubmit={sendCloneRequest}
      submitBtnText={isVM(source) ? t('Clone') : t('Create')}
    >
      <Form className="pf-v6-u-w-75-on-md pf-v6-u-w-66-on-lg pf-v6-u-m-auto" isHorizontal>
        <NameInput name={cloneName} setName={setCloneName} />
        <StartClonedVMCheckbox setStartCloneVM={setStartCloneVM} startCloneVM={startCloneVM} />
        {isVM(source) ? (
          <ConfigurationSummary vm={source} />
        ) : (
          <SnapshotContentConfigurationSummary snapshot={source} />
        )}
        <CloningStatus vmCloneRequest={cloneRequest || initialCloneRequest} />
      </Form>
    </TabModal>
  );
};

export default CloneVMModal;
