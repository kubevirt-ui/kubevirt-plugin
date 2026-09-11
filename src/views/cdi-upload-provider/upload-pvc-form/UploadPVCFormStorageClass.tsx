import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { StorageClassModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getSCSelectOptions } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';

type UploadPVCFormStorageClassProps = {
  applySP: boolean;
  setApplySP: Dispatch<SetStateAction<boolean>>;
  setStorageClassName: Dispatch<SetStateAction<string>>;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassName: string;
};

const UploadPVCFormStorageClass: FC<UploadPVCFormStorageClassProps> = ({
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
            placeholder={t('Select {{label}}', { label: StorageClassModel.label })}
            selected={storageClassName}
            setSelected={(scName: string) => setStorageClassName(scName)}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <Checkbox
          data-checked-state={applySP}
          data-test="apply-storage-provider"
          description={t(
            'Use optimized access mode & volume mode settings from StorageProfile resource.',
          )}
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
