import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRowPlain from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRowPlain';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup, GridItem } from '@patternfly/react-core';

import { VirtualizationQuota } from '../types';

type QuotaCreateFormProjectsProps = {
  onQuotaChange: (quota: VirtualizationQuota) => void;
  quota: VirtualizationQuota;
};

const QuotaCreateFormProjects: FC<QuotaCreateFormProjectsProps> = ({ onQuotaChange, quota }) => {
  const { t } = useKubevirtTranslation();
  const [allProjectNames] = useProjects();

  return (
    <FormGroup fieldId="quota-projects" isStack label={t('Projects')}>
      <MultiSelectTypeahead
        allResourceNames={allProjectNames}
        emptyValuePlaceholder={t('All projects')}
        selectedResourceNames={quota.projects ?? []}
        selectPlaceholder={t('Select project')}
        setSelectedResourceNames={(projects) => onQuotaChange({ ...quota, projects })}
      />
      <Checkbox
        onChange={(_, checked) =>
          onQuotaChange({
            ...quota,
            labelSelectors: [{ id: 0, key: '', value: '' }],
            useLabelSelectors: checked,
          })
        }
        id="quota-projects-labels"
        isChecked={quota.useLabelSelectors}
        label={t('Use label selectors to target specific projects')}
      />
      {quota.useLabelSelectors && (
        <LabelsList
          onLabelAdd={() =>
            onQuotaChange({
              ...quota,
              labelSelectors: [
                ...quota.labelSelectors,
                { id: quota.labelSelectors?.length ?? 0, key: '', value: '' },
              ],
            })
          }
          addRowText={t('Add label')}
          emptyStateAddRowText={t('Add label')}
          isEmpty={isEmpty(quota.labelSelectors)}
        >
          <GridItem span={6}>{t('Key')}</GridItem>
          <GridItem span={5}>{t('Value')}</GridItem>
          {quota.labelSelectors?.map((label, index) => (
            <LabelRowPlain
              onChange={(newLabel) =>
                onQuotaChange({
                  ...quota,
                  labelSelectors: quota.labelSelectors?.map((l) =>
                    l.id === newLabel.id ? newLabel : l,
                  ),
                })
              }
              onDelete={(id) =>
                onQuotaChange({
                  ...quota,
                  labelSelectors: quota.labelSelectors?.filter((l) => l.id !== id),
                })
              }
              key={index}
              label={label}
            />
          ))}
        </LabelsList>
      )}
    </FormGroup>
  );
};

export default QuotaCreateFormProjects;
