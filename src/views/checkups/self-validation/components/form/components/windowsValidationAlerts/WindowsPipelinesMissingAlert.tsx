import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, StackItem } from '@patternfly/react-core';

import {
  getPipelinesInstallLinkText,
  getPipelinesPrerequisiteDescription,
  getPipelinesPrerequisiteTitle,
} from './utils';

const WindowsPipelinesMissingAlert: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <StackItem className="pf-v6-u-pl-lg">
      <Alert
        isInline
        isLiveRegion
        title={getPipelinesPrerequisiteTitle(t)}
        variant={AlertVariant.danger}
      >
        {getPipelinesPrerequisiteDescription(t)}
        <div className="pf-v6-u-mt-sm">
          <ExternalLink href={documentationURL.PIPELINES_INSTALL}>
            {getPipelinesInstallLinkText(t)}
          </ExternalLink>
        </div>
      </Alert>
    </StackItem>
  );
};

export default WindowsPipelinesMissingAlert;
