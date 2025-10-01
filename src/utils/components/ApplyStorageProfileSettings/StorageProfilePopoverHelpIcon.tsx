import React, { FC } from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, PopoverPosition } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

const StorageProfilePopoverHelpIcon: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={
        <div>
          {t(
            'A storage profile provides recommended storage settings based on the associated storage class. A storage profile is allocated for each storage class.',
          )}
        </div>
      }
      footerContent={
        <Button
          component="a"
          href={documentationURL.STORAGE_PROFILES}
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
          isInline
          target="_blank"
          variant="link"
        >
          {t('Learn more')}
        </Button>
      }
      headerContent={t('Storage profile')}
      helpIconClassName="pf-v6-u-ml-sm"
      position={PopoverPosition.right}
    />
  );
};

export default StorageProfilePopoverHelpIcon;
