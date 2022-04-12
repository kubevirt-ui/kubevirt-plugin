import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { FieldGroup } from './FieldGroup';

type ExpandableOptionsFieldsProps = {
  optionalFields: TemplateParameter[];
};

export const ExpandableOptionsFields: React.FC<ExpandableOptionsFieldsProps> = ({
  optionalFields,
}) => {
  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = React.useState(true);

  if (optionalFields && optionalFields.length > 0)
    return (
      <ExpandableSection
        toggleText={t('Optional parameters')}
        data-test-id="expandable-optional-section"
        onToggle={() => setOptionalFieldsExpanded(!optionalFieldsExpanded)}
        isExpanded={optionalFieldsExpanded}
        isIndented
      >
        {optionalFields?.map((field) => (
          <FieldGroup key={field.name} field={field} />
        ))}
      </ExpandableSection>
    );
};
