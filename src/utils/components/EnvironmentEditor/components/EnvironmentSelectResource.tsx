import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import useEnvironmentsResources from '../hooks/useEnvironmentsResources';
import {
  getEnvironmentOptionKind,
  getEnvironmentOptionName,
  getEnvironmentOptionValue,
} from '../utils';

type EnvironmentSelectResourceProps = {
  diskName: string;
  environmentName?: string;
  environmentNamesSelected: string[];
  kind?: EnvironmentKind;
  namespace: string;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  serial: string;
};

const EnvironmentSelectResource: FC<EnvironmentSelectResourceProps> = ({
  diskName,
  environmentName,
  environmentNamesSelected,
  kind,
  namespace,
  onChange,
  serial,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    configMaps,
    error: loadError,
    loaded,
    secrets,
    serviceAccounts,
  } = useEnvironmentsResources(namespace);

  if (!loaded) return <Loading />;

  if (loadError)
    return (
      <Alert
        className="co-alert co-alert--scrollable"
        isInline
        title={t('An error occurred')}
        variant="danger"
      >
        <div className="co-pre-line">{loadError?.message}</div>
      </Alert>
    );

  const onSelect = (value: string) => {
    onChange(diskName, getEnvironmentOptionName(value), serial, getEnvironmentOptionKind(value));
  };

  const selectedValue = getEnvironmentOptionValue(environmentName, kind);

  const getEnhancedSelectOptionProps = (
    optionName: string,
    optionKind: EnvironmentKind,
  ): EnhancedSelectOptionProps => ({
    children: (
      <>
        <span className="sr-only">{optionKind}</span>
        <span className={`co-m-resource-icon co-m-resource-${optionKind}`}>
          {MapKindToAbbr[optionKind]}
        </span>
        {optionName}
      </>
    ),
    isDisabled: environmentNamesSelected?.includes(optionName),
    key: optionName,
    value: getEnvironmentOptionValue(optionName, optionKind),
  });

  return (
    <InlineFilterSelect
      options={[
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
      ]}
      toggleProps={{
        children: environmentName ?? t('Select a resource'),
        icon: kind ? (
          <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
        ) : null,
      }}
      selected={selectedValue}
      selectProps={{ 'aria-labelledby': 'environment-name-header' }}
      setSelected={onSelect}
    />
  );
};

export default EnvironmentSelectResource;
