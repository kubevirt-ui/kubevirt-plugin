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
  storageClasses,
  setStorageClassName,
  storageClassName,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Stack hasGutter>
      <StackItem>
        <label className="control-label co-required">{t('StorageClass')}</label>
        <Select
          menuAppendTo="parent"
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={(e, sc) => {
            setStorageClassName(sc);
            setIsOpen(false);
          }}
          variant={SelectVariant.single}
          selections={storageClassName}
          onFilter={FilterSCSelect(storageClasses, t)}
          hasInlineFilter
          maxHeight={200}
          direction="up"
        >
          {getSCSelectOptions(storageClasses, t)}
        </Select>
      </StackItem>
      <StackItem>
        <Checkbox
          id="apply-storage-provider"
          description={t(
            'Use optimized access mode & volume mode settings from StorageProfile resource.',
          )}
          isChecked={applySP}
          data-checked-state={applySP}
          onChange={() => setApplySP((value) => !value)}
          // isDisabled={!isSPSettingProvided}
          label={t('Apply optimized StorageProfile settings')}
          data-test="apply-storage-provider"
        />
      </StackItem>
    </Stack>
  );
};

export default UploadPVCFormStorageClass;
