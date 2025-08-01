import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { labelParser } from '@kubevirt-utils/components/ListPageFilter/utils';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type LabelsFieldProps = {
  initialInputValue?: string;
  labels: string[];
  setLabels: (labels: string[]) => void;
  vms: V1VirtualMachine[];
};

const LabelsField: FC<LabelsFieldProps> = ({ initialInputValue, labels, setLabels, vms }) => {
  const { t } = useKubevirtTranslation();

  const allLabels = useMemo(() => Array.from(labelParser(vms)), [vms]);

  return (
    <FormGroup label={t('Labels')}>
      <MultiSelectTypeahead
        allResourceNames={allLabels}
        data-test="adv-search-vm-labels"
        initialInputValue={initialInputValue}
        selectedResourceNames={labels}
        selectPlaceholder={t('Add label')}
        setSelectedResourceNames={setLabels}
      />
    </FormGroup>
  );
};

export default LabelsField;
