import React, { FC, ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, Icon, Spinner } from '@patternfly/react-core';
import { ExclamationCircleIcon, SaveIcon } from '@patternfly/react-icons';
import { SavedSearchEntry } from '@search/savedSearches/types';

type SavedSearchesStateHandlerProps = {
  children: ReactNode;
  loaded: boolean;
  loadError?: Error;
  searches: SavedSearchEntry[];
};

const SavedSearchesStateHandler: FC<SavedSearchesStateHandlerProps> = ({
  children,
  loaded,
  loadError,
  searches,
}) => {
  const { t } = useKubevirtTranslation();

  const emptyStateWrapperClass = 'pf-v6-u-mx-lg pf-v6-u-my-md saved-searches-dropdown-menu';

  if (loadError) {
    return (
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        className={emptyStateWrapperClass}
        gap={{ default: 'gapSm' }}
      >
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
        <span>{t('Failed to load searches')}</span>
      </Flex>
    );
  }

  if (!loaded) {
    return (
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        className={emptyStateWrapperClass}
        gap={{ default: 'gapMd' }}
      >
        <span>{t('Loading searches')}</span>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (isEmpty(searches)) {
    return (
      <div className={emptyStateWrapperClass}>
        <div className="pf-v6-u-font-weight-bold pf-v6-u-mb-sm">{t('No saved searches yet.')}</div>
        <div>
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Create a filter and click the{' '}
            <span className="pf-v6-u-font-weight-bold" style={{ whiteSpace: 'nowrap' }}>
              Save search <SaveIcon />
            </span>{' '}
            in the search bar to keep your frequent queries.
          </Trans>
        </div>
      </div>
    );
  }

  return children;
};

export default SavedSearchesStateHandler;
