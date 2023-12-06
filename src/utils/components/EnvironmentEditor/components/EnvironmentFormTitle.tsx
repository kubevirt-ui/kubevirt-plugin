import React, { FC, memo } from 'react';
import { useHistory } from 'react-router-dom';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

const EnvironmentFormTitle: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <>
      {!history.location.pathname.includes('/review/environment') && (
        <SearchItem id="Environment">
          <Title headingLevel="h2">{t('Environment')}</Title>
        </SearchItem>
      )}
      {t('Include all values from existing config maps, secrets or service accounts (as disk)')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'Add new values by referencing an existing config map, secret or service account. Using these values requires mounting them manually to the VM.',
        )}
      />
    </>
  );
});
EnvironmentFormTitle.displayName = 'EnvironmentFormTitle';

export default EnvironmentFormTitle;
