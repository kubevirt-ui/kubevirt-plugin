import React, { Dispatch, FC, SetStateAction } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import { useStorageClasses } from '@kubevirt-utils/hooks/useStorageClasses';
import { FormGroup } from '@patternfly/react-core';

type StorageClassFieldProps = {
  setStorageClasses: Dispatch<SetStateAction<string[]>>;
  storageClasses: string[];
  vms: V1VirtualMachine[];
};

const StorageClassField: FC<StorageClassFieldProps> = ({
  setStorageClasses,
  storageClasses,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const pvcMapper = usePVCMapper(null);

  const { allStorageClasses } = useStorageClasses(vms, pvcMapper);

  return (
    <FormGroup label={t('Storage class')}>
      <MultiSelectTypeahead
        allResourceNames={Array.from(allStorageClasses)}
        data-test="adv-search-vm-storage-class"
        selectedResourceNames={storageClasses}
        selectPlaceholder={t('Select storage class')}
        setSelectedResourceNames={setStorageClasses}
      />
    </FormGroup>
  );
};

export default StorageClassField;
