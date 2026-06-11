import React, { FC, RefObject } from 'react';
import { Trans } from 'react-i18next';

import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { buildFilterQueryString } from './utils';

type VirtualMachineFilteredEmptyStateProps = {
  clearAllFilters: () => void;
  filters: KubevirtFilterState;
  searchInputRef: RefObject<HTMLInputElement>;
};

const VirtualMachineFilteredEmptyState: FC<VirtualMachineFilteredEmptyStateProps> = ({
  clearAllFilters,
  filters,
  searchInputRef,
}) => {
  const { t } = useKubevirtTranslation();

  const queryString = buildFilterQueryString(filters);

  if (isEmpty(queryString)) return null;

  return (
    <EmptyState icon={SearchIcon} variant="lg">
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          No results found for <b>{queryString}</b>
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            isInline
            onClick={() => setTimeout(() => searchInputRef.current?.focus(), 0)}
            variant="link"
          >
            {t('Edit search')}
          </Button>
          <Button isInline onClick={clearAllFilters} variant="link">
            {t('Clear all filters')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default VirtualMachineFilteredEmptyState;
