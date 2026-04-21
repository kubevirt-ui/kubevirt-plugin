import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { PopoverPosition, Stack } from '@patternfly/react-core';

const PreviewFeaturesPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <Stack hasGutter>
              <ExternalLink href={documentationURL.DEV_PREVIEW} text={t('Developer Preview')} />
              <ExternalLink href={documentationURL.TECH_PREVIEW} text={t('Technology Preview')} />
            </Stack>
          }
          hide={hide}
          promptType={OLSPromptType.PREVIEW_FEATURES}
        />
      )}
      headerContent={t('Preview features')}
      helpIconClassName="preview-features-popover__icon"
      position={PopoverPosition.right}
    />
  );
};

export default PreviewFeaturesPopover;
