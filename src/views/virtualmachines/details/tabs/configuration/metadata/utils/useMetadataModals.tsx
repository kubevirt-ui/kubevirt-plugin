import React, { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { EditAnnotationsModal } from '@kubevirt-utils/components/MetadataModal/EditAnnotationsModal';
import { EditLabelsModal } from '@kubevirt-utils/components/MetadataModal/EditLabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';

import { updateAnnotation, updateLabels } from '../../details/utils/utils';

const useMetadataModals = (vm: V1VirtualMachine) => {
  const { createModal } = useModal();

  const onEditLabels = useCallback(
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

  const onEditAnnotations = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <EditAnnotationsModal
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
          onSubmit={(annotations) => updateAnnotation(vm, annotations)}
        />
      )),
    [createModal, vm],
  );

  return { onEditAnnotations, onEditLabels };
};

export default useMetadataModals;
