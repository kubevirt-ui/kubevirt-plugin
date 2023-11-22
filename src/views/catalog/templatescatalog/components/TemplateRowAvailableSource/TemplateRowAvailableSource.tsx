import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, Split, SplitItem } from '@patternfly/react-core';

import './TemplateRowAvailableSource.scss';

type TemplateRowAvailableSourceProps = {
  isBootSourceAvailable: boolean;
  source: string;
};

// Component for VM Template's Boot source availability column
const TemplateRowAvailableSource: React.FC<TemplateRowAvailableSourceProps> = ({
  isBootSourceAvailable,
  source,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Split hasGutter>
      <SplitItem className="template-row-available-source__source">{source}</SplitItem>
      {isBootSourceAvailable && (
        <SplitItem>
          <Badge key="available-boot">{t('Source available')}</Badge>
        </SplitItem>
      )}
    </Split>
  );
};

export default TemplateRowAvailableSource;
