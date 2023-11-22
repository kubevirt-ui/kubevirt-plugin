import * as React from 'react';
import { getVMTemplateBaseName } from 'src/views/templates/utils/selectors';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Text,
} from '@patternfly/react-core';

type BaseTemplateProps = {
  template: V1Template;
};

const BaseTemplate: React.FC<BaseTemplateProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const baseTemplate = getVMTemplateBaseName(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Base template')}</DescriptionListTerm>
      <DescriptionListDescription>
        {baseTemplate ? (
          <ResourceLink kind="Template" {...baseTemplate} />
        ) : (
          <Text className="text-muted">{t('Not available')}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BaseTemplate;
