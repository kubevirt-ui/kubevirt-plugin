import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { classifyAnnotations, Labels } from './utils/utils';
import { KeyValueModal } from './KeyValueModal';

type EditAnnotationsModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (annotations: Labels) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
};

export const EditAnnotationsModal: FC<EditAnnotationsModalProps> = ({
  isOpen,
  obj,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <KeyValueModal
      classifyEntries={classifyAnnotations}
      headerText={t('Edit annotations')}
      initialData={getAnnotations(obj, {})}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Save')}
    />
  );
};
