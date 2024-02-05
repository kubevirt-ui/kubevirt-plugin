import React, { FC, MouseEvent, useState } from 'react';

import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption } from '@patternfly/react-core';

type StorageClassSelectProps = {
  onStorageClassChange: (_: MouseEvent, value: string) => void;
  storageClassName: string;
  storageClassRequired: boolean;
};

const StorageClassSelect: FC<StorageClassSelectProps> = ({
  onStorageClassChange,
  storageClassName,
  storageClassRequired,
}) => {
  const { t } = useKubevirtTranslation();
  const [{ sortedStorageClasses }] = useDefaultStorageClass();

  const [isOpenStorageClass, setIsOpenStorageClass] = useState<boolean>(false);

  if (!storageClassRequired) return null;

  return (
    <FormGroup
      className="disk-source-form-group select-source-option"
      isRequired
      label={t('Storage class')}
    >
      <Select
        onSelect={(event: MouseEvent, value: string) => {
          onStorageClassChange(event, value);
          setIsOpenStorageClass(false);
        }}
        hasInlineFilter
        isOpen={isOpenStorageClass}
        maxHeight={200}
        onToggle={setIsOpenStorageClass}
        placeholderText={t('Select storage class')}
        selections={storageClassName}
      >
        {sortedStorageClasses?.map((name) => (
          <SelectOption key={name} value={name} />
        ))}
      </Select>
    </FormGroup>
  );
};

export default StorageClassSelect;
