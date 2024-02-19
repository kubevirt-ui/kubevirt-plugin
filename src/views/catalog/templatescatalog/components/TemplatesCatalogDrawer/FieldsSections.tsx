import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ExpandableSection } from '@patternfly/react-core';

import { useDrawerContext } from './hooks/useDrawerContext';
import { FieldGroup } from './FieldGroup';
import { changeTemplateParameterValue, getTemplateParametersSplit } from './utils';

const FieldsSections: FC = () => {
  const { t } = useKubevirtTranslation();

  const { setTemplate, template } = useDrawerContext();
  const [requiredParameters, optionalParameters] = getTemplateParametersSplit(template?.parameters);

  const [requiredSectionOpen, setRequiredSectionOpen] = useState(true);

  const onFieldValueChange = (name: string, value: string) => {
    setTemplate((draftTemplate) => changeTemplateParameterValue(draftTemplate, name, value));
  };
  return (
    <>
      {!isEmpty(requiredParameters) && (
        <ExpandableSection
          isExpanded={requiredSectionOpen}
          isIndented
          onToggle={(_event, val) => setRequiredSectionOpen(val)}
          toggleText={t('Required parameters')}
        >
          {requiredParameters.map((param) => (
            <FieldGroup field={param} key={param.name} onChange={onFieldValueChange} />
          ))}
        </ExpandableSection>
      )}
      {!isEmpty(optionalParameters) && (
        <ExpandableSection isIndented toggleText={t('Optional parameters')}>
          {optionalParameters.map((param) => (
            <FieldGroup field={param} key={param.name} onChange={onFieldValueChange} />
          ))}
        </ExpandableSection>
      )}
    </>
  );
};

export default FieldsSections;
