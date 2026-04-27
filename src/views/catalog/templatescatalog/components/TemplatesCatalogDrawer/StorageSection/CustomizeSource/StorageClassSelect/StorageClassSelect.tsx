import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useReadyStorageClasses from '@kubevirt-utils/hooks/useReadyStorageClasses/useReadyStorageClasses';
import { FormGroup } from '@patternfly/react-core';

type StorageClassSelectProps = {
  onStorageClassChange: (value: string) => void;
  storageClassName: string;
  storageClassRequired: boolean;
};

const StorageClassSelect: FC<StorageClassSelectProps> = ({
  onStorageClassChange,
  storageClassName,
  storageClassRequired,
}) => {
  const { t } = useKubevirtTranslation();
  const [{ sortedStorageClasses }] = useReadyStorageClasses();

  if (!storageClassRequired) return null;

  return (
    <FormGroup
      className="disk-source-form-group select-source-option"
      isRequired
      label={t('Storage class')}
    >
      <InlineFilterSelect
        options={sortedStorageClasses?.map((name) => ({ children: name, value: name }))}
        placeholder={t('Select storage class')}
        selected={storageClassName}
        setSelected={onStorageClassChange}
      />
    </FormGroup>
  );
};

export default StorageClassSelect;
