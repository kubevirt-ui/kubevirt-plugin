import React, { useState } from 'react';

import {
  FilterSCSelect,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/Filters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Select, SelectVariant, Stack, StackItem } from '@patternfly/react-core';

const UploadPVCFormStorageClass = ({
  applySP,
  setApplySP,
  setStorageClassName,
  storageClasses,
  storageClassName,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Stack hasGutter>
      <StackItem>
        <label className="control-label co-required">{t('StorageClass')}</label>
        <Select
          onSelect={(e, sc) => {
            setStorageClassName(sc);
            setIsOpen(false);
          }}
          direction="up"
          hasInlineFilter
          isOpen={isOpen}
          maxHeight={200}
          menuAppendTo="parent"
          onFilter={FilterSCSelect(storageClasses)}
          onToggle={setIsOpen}
          selections={storageClassName}
          variant={SelectVariant.single}
        >
          {getSCSelectOptions(storageClasses)}
        </Select>
      </StackItem>
      <StackItem>
        <Checkbox
          description={t(
            'Use optimized access mode & volume mode settings from StorageProfile resource.',
          )}
          data-checked-state={applySP}
          data-test="apply-storage-provider"
          id="apply-storage-provider"
          isChecked={applySP}
          // isDisabled={!isSPSettingProvided}
          label={t('Apply optimized StorageProfile settings')}
          onChange={() => setApplySP((value) => !value)}
        />
      </StackItem>
    </Stack>
  );
};

export default UploadPVCFormStorageClass;
