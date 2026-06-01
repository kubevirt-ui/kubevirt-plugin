import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Template } from '@kubevirt-utils/resources/template';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';

import useTemplateOptions from './hooks/useTemplateOptions';
import { getTemplateOptionKey } from './utils';

type SelectTemplateProps = {
  dataTestId?: string;
  isDisabled?: boolean;
  namespace?: string;
  onTemplateSelect: (template: Template) => void;
  selectedTemplate: Template | undefined;
};

const SelectTemplate: FC<SelectTemplateProps> = ({
  dataTestId,
  isDisabled,
  namespace,
  onTemplateSelect,
  selectedTemplate,
}) => {
  const { t } = useKubevirtTranslation();
  const { hasOptions, options, templateMap } = useTemplateOptions(namespace);

  return (
    <InlineFilterSelect
      setSelected={(key: string) => {
        onTemplateSelect(templateMap.get(key));
      }}
      options={options}
      placeholder={t('Select a template')}
      searchPlaceholder={t('Search templates')}
      selected={getTemplateOptionKey(selectedTemplate)}
      showSearch={hasOptions}
      toggleProps={{ 'data-test-id': dataTestId, isDisabled, isFullWidth: true }}
    />
  );
};

export default SelectTemplate;
