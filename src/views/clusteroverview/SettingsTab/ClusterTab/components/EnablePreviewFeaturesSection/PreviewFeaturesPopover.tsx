import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { DEV_PREVIEW_LINK, TECH_PREVIEW_LINK } from '@kubevirt-utils/constants/url-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './PreviewFeaturesPopover.scss';

const PreviewFeaturesPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            {t(
              'Preview features are for testing purposes and should not be used in production environments.',
            )}
          </StackItem>
          <p>
            <ExternalLink href={DEV_PREVIEW_LINK} text={t('Developer Preview')} />
          </p>
          <p>
            <ExternalLink href={TECH_PREVIEW_LINK} text={t('Technology Preview')} />
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
