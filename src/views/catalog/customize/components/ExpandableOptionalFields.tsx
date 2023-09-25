import React, { FC, useState } from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { FieldGroup } from './FieldGroup';

import './ExpandableOptionsFields.scss';

type ExpandableOptionsFieldsProps = {
  optionalFields: TemplateParameter[];
};

export const ExpandableOptionsFields: FC<ExpandableOptionsFieldsProps> = ({ optionalFields }) => {
  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = useState(false);

  if (!optionalFields || optionalFields.length === 0) return null;

  return (
    <ExpandableSection
      data-test-id="expandable-optional-section"
      isExpanded={optionalFieldsExpanded}
      isIndented
      onToggle={() => setOptionalFieldsExpanded(!optionalFieldsExpanded)}
      toggleText={t('Optional parameters')}
    >
      {optionalFields?.map((field) => (
        <FieldGroup
          className="expandable-section-content-margin-top"
          field={field}
          key={field.name}
        />
      ))}
    </ExpandableSection>
  );
};
