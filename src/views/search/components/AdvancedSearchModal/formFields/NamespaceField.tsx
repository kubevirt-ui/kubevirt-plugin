import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import useNamespacesWithVMs from '../hooks/useNamespacesWithVMs';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type NamespaceFieldProps = {
  vms: V1VirtualMachine[];
};

const NamespaceField: FC<NamespaceFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Namespace);

  const allNamespaceNames = useNamespacesWithVMs(vms);

  return (
    <FormGroup label={t('Namespace')}>
      <MultiSelectTypeahead
        allResourceNames={allNamespaceNames}
        data-test="adv-search-vm-namespace"
        emptyValuePlaceholder={t('All namespaces')}
        selectedResourceNames={value}
        selectPlaceholder={t('Select namespace')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default NamespaceField;
