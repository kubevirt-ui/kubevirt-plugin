import React, { FC, useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import LabelKeyField from './components/LabelKeyField';
import { Labels } from './utils/types';
import { classifyLabels, validateLabelEntry } from './utils/utils';
import { KeyValueModal } from './KeyValueModal';

type EditLabelsModalProps = {
  initialLabels?: Labels;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onLabelsSubmit: (labels: Labels) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
};

export const EditLabelsModal: FC<EditLabelsModalProps> = ({
  initialLabels,
  isOpen,
  obj,
  onClose,
  onLabelsSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const validateEntry = useCallback(
    (key: string, value: string) => validateLabelEntry(key, value, t),
    [t],
  );

  return (
    <KeyValueModal
      classifyEntries={classifyLabels}
      headerText={t('Edit labels')}
      initialData={initialLabels ?? getLabels(obj) ?? {}}
      isOpen={isOpen}
      KeyRenderer={LabelKeyField}
      obj={obj}
      onClose={onClose}
      onSubmit={onLabelsSubmit}
      submitBtnText={t('Save')}
      validateEntry={validateEntry}
    />
  );
};
