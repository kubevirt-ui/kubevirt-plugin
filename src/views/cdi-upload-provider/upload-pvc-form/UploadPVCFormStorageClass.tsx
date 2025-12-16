import React from 'react';

import { StorageClassModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getSCSelectOptions } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';

const UploadPVCFormStorageClass = ({
  applySP,
  setApplySP,
  setStorageClassName,
  storageClasses,
  storageClassName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup isRequired label={t('StorageClass')}>
          <InlineFilterSelect
            options={getSCSelectOptions(storageClasses)}
            selected={storageClassName}
            setSelected={(scName: string) => setStorageClassName(scName)}
            toggleProps={{ placeholder: t('Select {{label}}', { label: StorageClassModel.label }) }}
          />
        </FormGroup>
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
