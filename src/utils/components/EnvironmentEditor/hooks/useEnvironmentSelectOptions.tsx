import React, { useCallback, useMemo } from 'react';

import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { EnvironmentKind, type EnvironmentVariable, MapKindToAbbr } from '../constants';
import { getEnvironmentOptionValue } from '../utils';

import useEnvironmentsResources from './useEnvironmentsResources';

const useEnvironmentSelectOptions = (
  namespace: string,
  environments: EnvironmentVariable[],
): { loaded: boolean; loadError: unknown; selectOptions: EnhancedSelectOptionProps[] } => {
  const { t } = useKubevirtTranslation();
  const environmentResources = useEnvironmentsResources(namespace);
  const { configMaps, loaded, secrets, serviceAccounts } = environmentResources;
  const loadError: unknown = environmentResources.error as unknown;

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
      value: getEnvironmentOptionValue(optionName, optionKind),
      valueForFilter: optionName,
    }),
    [environments],
  );

  const selectOptions = useMemo(() => {
    if (!loaded) {
      return [];
    }

    return [
      ...secrets.map((secret) => ({
        group: t('Secrets'),
        ...getEnhancedSelectOptionProps(secret.metadata.name, EnvironmentKind.secret),
      })),
      ...configMaps.map((configMap) => ({
        group: t('ConfigMaps'),
        ...getEnhancedSelectOptionProps(configMap.metadata.name, EnvironmentKind.configMap),
      })),
      ...serviceAccounts.map((serviceAccount) => ({
        group: t('ServiceAccounts'),
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
