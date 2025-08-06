import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { FormGroup } from '@patternfly/react-core';

import MultiSelectTypeahead from '../../../../../utils/components/MultiSelectTypeahead/MultiSelectTypeahead';

type OperatingSystemFieldProps = {
  operatingSystems: string[];
  setOperatingSystems: (operatingSystems: string[]) => void;
};

const OperatingSystemField: FC<OperatingSystemFieldProps> = ({
  operatingSystems,
  setOperatingSystems,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Operating system')}>
      <MultiSelectTypeahead
        allResourceNames={Object.values(OS_NAME_LABELS)}
        data-test="adv-search-vm-os"
        selectedResourceNames={operatingSystems}
        setSelectedResourceNames={setOperatingSystems}
      />
    </FormGroup>
  );
};

export default OperatingSystemField;
