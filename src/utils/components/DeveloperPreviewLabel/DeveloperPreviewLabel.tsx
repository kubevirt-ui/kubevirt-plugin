import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import './DeveloperPreviewLabel.scss';

const DeveloperPreviewLabel: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Popover
      bodyContent={t(
        'Developer preview features are not intended to use in production environments. The clusters deployed with the developer preview features are developmental clusters and are not currently supported by Red Hat.',
      )}
    >
      <Label className="dev-preview-label" icon={<InfoCircleIcon />} isCompact>
        {t('Developer preview')}
      </Label>
    </Popover>
  );
};

export default DeveloperPreviewLabel;
