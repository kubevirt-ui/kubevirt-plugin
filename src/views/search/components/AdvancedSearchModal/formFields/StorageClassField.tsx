import React, { type FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import { getVMStorageClasses } from '@kubevirt-utils/resources/vm/utils/getVMStorageClasses';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type StorageClassFieldProps = {
  vms: V1VirtualMachine[];
};

const StorageClassField: FC<StorageClassFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.StorageClass);

  const pvcMapper = usePVCMapper(null);

  const { allStorageClasses } = getVMStorageClasses(vms, pvcMapper);

  return (
    <FormGroup label={t('Storage class')}>
      <MultiSelectTypeahead
        allResourceNames={Array.from(allStorageClasses)}
        data-test="adv-search-vm-storage-class"
        selectedResourceNames={value}
        selectPlaceholder={t('Select storage class')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default StorageClassField;
