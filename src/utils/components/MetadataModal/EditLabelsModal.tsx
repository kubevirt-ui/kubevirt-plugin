import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import LabelKeySelect from './components/LabelKeySelect';
import {
  classifyLabelsForModal,
  isLabelKeyValid,
  isLabelValueValid,
  isSystemLabelKey,
  Labels,
} from './utils/utils';
import { KeyValueModal } from './KeyValueModal';

type EditLabelsModalProps = {
  initialLabels?: Labels;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onLabelsSubmit: (labels: Labels) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
};

const renderLabelKeySelect = (props: {
  existingKeys: string[];
  onSelect: (key: string) => void;
  selectedKey: string;
}) => <LabelKeySelect {...props} />;

export const EditLabelsModal: FC<EditLabelsModalProps> = ({
  initialLabels,
  isOpen,
  obj,
  onClose,
  onLabelsSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const validateEntry = (key: string, value: string): string | undefined => {
    if (key && !isLabelKeyValid(key))
      return t(
        'Invalid label key format. Keys must consist of alphanumeric characters, dashes, underscores, or dots, with an optional DNS subdomain prefix.',
      );
    if (key) {
      const namePart = key.includes('/') ? key.split('/')[1] : key;
      const prefixPart = key.includes('/') ? key.split('/')[0] : '';
      if (namePart.length > 63) return t('Label key name must be 63 characters or fewer.');
      if (prefixPart.length > 253) return t('Label key prefix must be 253 characters or fewer.');
    }
    if (value && !isLabelValueValid(value))
      return t(
        'Invalid label value. Values must consist of alphanumeric characters, dashes, underscores, or dots.',
      );
    if (value && value.length > 63) return t('Label value must be 63 characters or fewer.');
    return undefined;
  };

  return (
    <KeyValueModal
      classifyEntries={classifyLabelsForModal}
      headerText={t('Edit labels')}
      initialData={initialLabels ?? getLabels(obj) ?? {}}
      isOpen={isOpen}
      isSystemKey={isSystemLabelKey}
      keyRenderer={renderLabelKeySelect}
      obj={obj}
      onClose={onClose}
      onSubmit={onLabelsSubmit}
      submitBtnText={t('Save')}
      validateEntry={validateEntry}
    />
  );
};
