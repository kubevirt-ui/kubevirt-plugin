import React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMTemplateSource } from '@kubevirt-utils/resources/template';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type BootSourceProps = {
  template: V1Template;
};

const BootSource: React.FC<BootSourceProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isBootSourceAvailable } = useVMTemplateSource(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Boot source')}</DescriptionListTerm>
      <DescriptionListDescription>
        {isBootSourceAvailable ? t('Available') : t('Unavailable')}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BootSource;
