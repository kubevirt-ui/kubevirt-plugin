import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition, Stack } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const PreviewFeaturesPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <p>
            <ExternalLink href={documentationURL.DEV_PREVIEW} text={t('Developer Preview')} />
          </p>
          <p>
            <ExternalLink href={documentationURL.TECH_PREVIEW} text={t('Technology Preview')} />
          </p>
        </Stack>
      }
      className="preview-features-popover"
      headerContent={<>{t('Preview features')}</>}
      maxWidth="550px"
      position={PopoverPosition.right}
    >
      <HelpIcon className="preview-features-popover__icon" />
    </Popover>
  );
};

export default PreviewFeaturesPopover;
