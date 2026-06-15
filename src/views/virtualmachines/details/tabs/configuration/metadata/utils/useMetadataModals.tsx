import React, { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { EditLabelsModal } from '@kubevirt-utils/components/MetadataModal/EditLabelsModal';
import { KeyValueModal } from '@kubevirt-utils/components/MetadataModal/KeyValueModal';
import {
  classifyAnnotationsForModal,
  isSystemAnnotationKey,
} from '@kubevirt-utils/components/MetadataModal/utils/utils';
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
        <KeyValueModal
          classifyEntries={classifyAnnotationsForModal}
          isOpen={isOpen}
          isSystemKey={isSystemAnnotationKey}
          obj={vm}
          onClose={onClose}
          onSubmit={(annotations) => updateAnnotation(vm, annotations)}
        />
      )),
    [createModal, vm],
  );

  const onEditAnnotationsAdvanced = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <KeyValueModal
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
          onSubmit={(annotations) => updateAnnotation(vm, annotations)}
        />
      )),
    [createModal, vm],
  );

  return { onEditAnnotations, onEditAnnotationsAdvanced, onEditLabels };
};

export default useMetadataModals;
