import { useCallback, useEffect, useMemo, useState } from 'react';

import { DataSourceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { TEST_SUITE_TIER2 } from '../../utils';

import { isReadyWindowsDataSource } from './utils';

const useWindowsValidationFormState = (selectedTestSuites: string[], cluster: string) => {
  const [acceptWindowsEula, setAcceptWindowsEula] = useState<boolean>(false);
  const [isEulaConfirmed, setIsEulaConfirmed] = useState<boolean>(false);
  const [winImageDownloadUrl, setWinImageDownloadUrl] = useState<string>('');
  const [winImageName, setWinImageName] = useState<string>('');

  const isTier2Selected = selectedTestSuites.includes(TEST_SUITE_TIER2);

  const [dataSources, dataSourcesLoaded, dataSourcesError] = useK8sWatchData<V1beta1DataSource[]>(
    acceptWindowsEula
      ? {
          cluster,
          groupVersionKind: DataSourceModelGroupVersionKind,
          isList: true,
          selector: {
            matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
          },
        }
      : null,
  );

  const dataSourceOptions = useMemo(
    () =>
      [...(dataSources || [])]
        .filter(isReadyWindowsDataSource)
        .sort((a, b) => {
          const aKey = `${getNamespace(a)}/${getName(a)}`;
          const bKey = `${getNamespace(b)}/${getName(b)}`;
          return aKey.localeCompare(bKey);
        })
        .map((dataSource) => {
          const dsNamespace = getNamespace(dataSource);
          const dsName = getName(dataSource);
          const value = `${dsNamespace}/${dsName}`;
          return { children: value, value };
        }),
    [dataSources],
  );

  const handleAcceptWindowsEulaChange = useCallback((checked: boolean) => {
    setAcceptWindowsEula(checked);
    if (!checked) {
      setIsEulaConfirmed(false);
      setWinImageDownloadUrl('');
      setWinImageName('');
    }
  }, []);

  useEffect(() => {
    if (!isTier2Selected && acceptWindowsEula) {
      handleAcceptWindowsEulaChange(false);
    }
  }, [isTier2Selected, acceptWindowsEula, handleAcceptWindowsEulaChange]);

  return {
    acceptWindowsEula,
    dataSourceOptions,
    dataSourcesError: Boolean(dataSourcesError),
    dataSourcesLoaded,
    handleAcceptWindowsEulaChange,
    isEulaConfirmed,
    isTier2Selected,
    setIsEulaConfirmed,
    setWinImageDownloadUrl,
    setWinImageName,
    winImageDownloadUrl,
    winImageName,
  };
};

export default useWindowsValidationFormState;
