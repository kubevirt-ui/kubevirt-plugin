import React, { useMemo } from 'react';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ErrorState,
  SkeletonTableBody,
  SkeletonTableHead,
} from '@patternfly/react-component-groups';
import { DataViewState, DataViewTableBasicProps } from '@patternfly/react-data-view';

import VirtualMachineEmptyState from '../components/VirtualMachineEmptyState/VirtualMachineEmptyState';

const useTableStates = (
  namespace: string,
  error: any,
  loaded: boolean,
  noVMs: boolean,
): [
  bodyStates: DataViewTableBasicProps['bodyStates'],
  headStates: DataViewTableBasicProps['headStates'],
  currentListState?: DataViewState,
] => {
  const { t } = useKubevirtTranslation();

  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`;

  const bodyStates = useMemo(
    () => ({
      [DataViewState.empty]: (
        <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
      ),
      [DataViewState.error]: (
        <ErrorState
          bodyText={error?.message}
          titleText={error?.code === 404 ? t('404: Not Found') : t('Error')}
        />
      ),
      [DataViewState.loading]: <SkeletonTableBody columnsCount={8} rowsCount={5} />,
    }),
    [catalogURL, error, namespace, t],
  );

  const headState = useMemo(
    () => ({
      [DataViewState.empty]: <></>,
      [DataViewState.error]: <></>,
      [DataViewState.loading]: <SkeletonTableHead />,
    }),
    [],
  );

  if (error) return [bodyStates, headState, DataViewState.error];

  if (loaded && noVMs) return [bodyStates, headState, DataViewState.empty];

  if (!loaded) return [bodyStates, headState, DataViewState.loading];

  return [bodyStates, headState];
};

export default useTableStates;
