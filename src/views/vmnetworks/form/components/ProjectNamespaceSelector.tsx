import React, { type FC, type ReactElement, useCallback } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRow from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRow';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, CardBody, FormGroup, Stack } from '@patternfly/react-core';

import { type VMNetworkForm } from '../constants';

import SelectedProjects from './SelectedProjects';

const ProjectNamespaceSelector: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<VMNetworkForm>();
  const matchLabels =
    useWatch({ control, name: 'network.spec.namespaceSelector.matchLabels' }) ?? {};

  const hasValidMatchLabels =
    !isEmpty(matchLabels) && !(Object.keys(matchLabels).length === 1 && matchLabels[''] === '');

  const handleLabelChange = useCallback(
    (
      labelSelectorPairs: [string, string][],
      index: number,
      onChange: (value: Record<string, string>) => void,
    ): ((newLabel: { key: string; value?: string }) => void) =>
      (newLabel: { key: string; value?: string }): void => {
        const updated = [...labelSelectorPairs];
        updated[index] = [newLabel.key, newLabel.value ?? ''];
        onChange(Object.fromEntries(updated));
      },
    [],
  );

  const handleLabelDelete = useCallback(
    (
      labelSelectorPairs: [string, string][],
      index: number,
      onChange: (value: Record<string, string>) => void,
    ): (() => void) =>
      (): void => {
        onChange(Object.fromEntries(labelSelectorPairs.filter((_entry, idx) => idx !== index)));
      },
    [],
  );

  const renderMatchLabels = useCallback(
    ({
      field: { onChange, value: matchLabel },
    }: {
      field: {
        onChange: (value: Record<string, string>) => void;
        value: Record<string, string>;
      };
    }): ReactElement => {
      const labelSelectorPairs = Object.entries(matchLabel ?? {}) as [string, string][];
      return (
        <FormGroup>
          <Card>
            <CardBody>
              <LabelsList
                emptyStateAddRowText={t('Add label to specify qualifying projects')}
                isEmpty={isEmpty(labelSelectorPairs)}
                onLabelAdd={() => onChange(Object.fromEntries([...labelSelectorPairs, ['', '']]))}
                withKeyValueTitle
              >
                {labelSelectorPairs.map(([key, value], index) => (
                  <LabelRow
                    key={`${key}=${value}`}
                    label={{ id: index, key, value }}
                    onChange={handleLabelChange(labelSelectorPairs, index, onChange)}
                    onDelete={handleLabelDelete(labelSelectorPairs, index, onChange)}
                    withKeyValueTitle={false}
                  />
                ))}
              </LabelsList>
            </CardBody>
          </Card>
        </FormGroup>
      );
    },
    [handleLabelChange, handleLabelDelete, t],
  );

  return (
    <Stack className="pf-v6-u-pl-md" hasGutter>
      <Controller
        control={control}
        name="network.spec.namespaceSelector.matchLabels"
        render={renderMatchLabels}
      />
      {hasValidMatchLabels && <SelectedProjects />}
    </Stack>
  );
};

export default ProjectNamespaceSelector;
