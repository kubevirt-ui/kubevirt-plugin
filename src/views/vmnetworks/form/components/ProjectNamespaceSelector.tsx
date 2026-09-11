import { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRow from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRow';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, CardBody, FormGroup, Stack } from '@patternfly/react-core';

import { type VMNetworkForm } from '../constants';

import SelectedProjects from './SelectedProjects';

const ProjectNamespaceSelector: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<VMNetworkForm>();
  const matchLabels = watch('network.spec.namespaceSelector.matchLabels') ?? {};

  const hasValidMatchLabels =
    !isEmpty(matchLabels) && !(Object.keys(matchLabels).length === 1 && matchLabels[''] === '');

  return (
    <Stack className="pf-v6-u-pl-md" hasGutter>
      <Controller
        control={control}
        name="network.spec.namespaceSelector.matchLabels"
        render={({ field: { onChange, value: matchLabel } }) => {
          const labelSelectorPairs = Object.entries(matchLabel);

          const handleLabelDelete = (deleteIndex: number): void => {
            onChange(
              Object.fromEntries(labelSelectorPairs.filter((_entry, i) => i !== deleteIndex)),
            );
          };

          return (
            <FormGroup>
              <Card>
                <CardBody>
                  <LabelsList
                    emptyStateAddRowText={t('Add label to specify qualifying projects')}
                    isEmpty={isEmpty(labelSelectorPairs)}
                    onLabelAdd={() =>
                      onChange(Object.fromEntries([...labelSelectorPairs, ['', '']]))
                    }
                    withKeyValueTitle
                  >
                    {labelSelectorPairs.map(([key, value], index) => (
                      <LabelRow
                        key={`${key}:${value}`}
                        label={{ id: index, key, value }}
                        onChange={(newLabel) => {
                          labelSelectorPairs[index] = [newLabel.key, newLabel.value];
                          onChange(Object.fromEntries(labelSelectorPairs));
                        }}
                        onDelete={() => handleLabelDelete(index)}
                        withKeyValueTitle={false}
                      />
                    ))}
                  </LabelsList>
                </CardBody>
              </Card>
            </FormGroup>
          );
        }}
      />
      {hasValidMatchLabels && <SelectedProjects />}
    </Stack>
  );
};

export default ProjectNamespaceSelector;
