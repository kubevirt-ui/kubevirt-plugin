import React, { useCallback, useMemo } from 'react';

import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { EnvironmentKind, EnvironmentVariable, MapKindToAbbr } from '../constants';
import { getEnvironmentOptionValue } from '../utils';

import useEnvironmentsResources from './useEnvironmentsResources';

const useEnvironmentSelectOptions = (
  namespace: string,
  environments: EnvironmentVariable[],
): { loaded: boolean; loadError: any; selectOptions: EnhancedSelectOptionProps[] } => {
  const { t } = useKubevirtTranslation();
  const {
    configMaps,
    error: loadError,
    loaded,
    secrets,
    serviceAccounts,
  } = useEnvironmentsResources(namespace);

  const getEnhancedSelectOptionProps = useCallback(
    (optionName: string, optionKind: EnvironmentKind): EnhancedSelectOptionProps => ({
      children: (
        <>
          <span className="sr-only">{optionKind}</span>
          <span className={`co-m-resource-icon co-m-resource-${optionKind}`}>
            {MapKindToAbbr[optionKind]}
          </span>
          {optionName}
        </>
      ),
      isDisabled: environments.some((env) => env.name === optionName),
      key: optionName,
      value: getEnvironmentOptionValue(optionName, optionKind),
      valueForFilter: optionName,
    }),
    [environments],
  );

  const selectOptions = useMemo(() => {
    if (!loaded) return [];

    return [
      ...secrets.map((secret) => ({
        group: t('Secrets'),
        ...getEnhancedSelectOptionProps(secret.metadata.name, EnvironmentKind.secret),
      })),
      ...configMaps.map((configMap) => ({
        group: t('Config Maps'),
        ...getEnhancedSelectOptionProps(configMap.metadata.name, EnvironmentKind.configMap),
      })),
      ...serviceAccounts.map((serviceAccount) => ({
        group: t('Service Accounts'),
        ...getEnhancedSelectOptionProps(
          serviceAccount.metadata.name,
          EnvironmentKind.serviceAccount,
        ),
      })),
    ];
  }, [loaded, secrets, configMaps, serviceAccounts, getEnhancedSelectOptionProps, t]);

  return { loaded, loadError, selectOptions };
};

export default useEnvironmentSelectOptions;
