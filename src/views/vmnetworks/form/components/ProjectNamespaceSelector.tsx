import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRow from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRow';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, CardBody, FormGroup, Stack } from '@patternfly/react-core';

import { VMNetworkForm } from '../constants';

import SelectedProjects from './SelectedProjects';

const ProjectNamespaceSelector: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<VMNetworkForm>();
  const matchLabels = watch('network.spec.namespaceSelector.matchLabels') || {};

  const hasValidMatchLabels =
    !isEmpty(matchLabels) && !(Object.keys(matchLabels).length === 1 && matchLabels[''] === '');

  return (
    <Stack className="pf-v6-u-pl-md" hasGutter>
      <Controller
        render={({ field: { onChange, value: matchLabel } }) => {
          const labelSelectorPairs = Object.entries(matchLabel);
          return (
            <FormGroup>
              <Card>
                <CardBody>
                  <LabelsList
                    onLabelAdd={() =>
                      onChange(Object.fromEntries([...labelSelectorPairs, ['', '']]))
                    }
                    emptyStateAddRowText={t('Add label to specify qualifying projects')}
                    isEmpty={isEmpty(labelSelectorPairs)}
                    withKeyValueTitle
                  >
                    {labelSelectorPairs.map(([key, value], index) => (
                      <LabelRow
                        onChange={(newLabel) => {
                          labelSelectorPairs[index] = [newLabel.key, newLabel.value];
                          onChange(Object.fromEntries(labelSelectorPairs));
                        }}
                        onDelete={() =>
                          onChange(
                            Object.fromEntries(labelSelectorPairs.filter((_, i) => i !== index)),
                          )
                        }
                        key={index}
                        label={{ id: index, key, value }}
                        withKeyValueTitle={false}
                      />
                    ))}
                  </LabelsList>
                </CardBody>
              </Card>
            </FormGroup>
          );
        }}
        control={control}
        name="network.spec.namespaceSelector.matchLabels"
      />
      {hasValidMatchLabels && <SelectedProjects />}
    </Stack>
  );
};

export default ProjectNamespaceSelector;
