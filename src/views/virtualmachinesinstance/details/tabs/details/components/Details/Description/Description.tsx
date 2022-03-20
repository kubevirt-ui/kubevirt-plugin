import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

type DescriptionProps = {
  description: string;
};

const Description: React.FC<DescriptionProps> = ({ description }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
      <DescriptionListDescription>{description || t('Not available')}</DescriptionListDescription>
    </>
  );
};

export default Description;
