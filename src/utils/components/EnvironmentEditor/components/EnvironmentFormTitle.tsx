import React, { FC, memo } from 'react';
import { useLocation } from 'react-router';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Title } from '@patternfly/react-core';

const EnvironmentFormTitle: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  return (
    <>
      {!location.pathname.includes('/review/environment') && (
        <SearchItem id="Environment">
          <Title headingLevel="h2">{t('Environment')}</Title>
        </SearchItem>
      )}
      {t('Include all values from existing config maps, secrets, or service accounts (as disk)')}{' '}
      <HelpTextIcon
        bodyContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={t(
              'Add new values by referencing an existing config map, secret, or service account. Using these values requires mounting them manually to the VM.',
            )}
            hide={hide}
            promptType={OLSPromptType.ENVIRONMENT_VARS}
          />
        )}
      />
    </>
  );
});
EnvironmentFormTitle.displayName = 'EnvironmentFormTitle';

export default EnvironmentFormTitle;
