import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { labelParser } from '@kubevirt-utils/components/ListPageFilter/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

type LabelsMultiSelectProps = {
  'data-test'?: string;
  initialInputValue?: string;
  labels: string[];
  setLabels: React.Dispatch<React.SetStateAction<string[]>>;
};

const LabelsMultiSelect: FC<LabelsMultiSelectProps> = ({
  'data-test': dataTest,
  initialInputValue,
  labels,
  setLabels,
}) => {
  const [vms] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespaced: true,
  });

  const allLabels = useMemo(() => Array.from(labelParser(vms)), [vms]);

  const labelOptions = useMemo<MultiTypeaheadSelectOption[]>(
    () =>
      allLabels.map((label) => ({
        content: label,
        selected: labels.includes(label),
        value: label,
      })),
    [labels, allLabels],
  );

  return (
    <MultiTypeaheadSelect
      onSelectionChange={(_e, selectedLabels: string[]) => {
        setLabels(selectedLabels);
      }}
      initialInputValue={initialInputValue}
      initialOptions={labelOptions}
      isScrollable
      placeholder={t('Add label')}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default LabelsMultiSelect;
