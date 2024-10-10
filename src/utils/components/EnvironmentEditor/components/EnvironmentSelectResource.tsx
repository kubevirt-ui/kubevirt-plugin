import React, { ChangeEvent, FC, ReactElement, useCallback, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Divider } from '@patternfly/react-core';
import { Select, SelectGroup, SelectVariant } from '@patternfly/react-core/deprecated';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import useEnvironmentsResources from '../hooks/useEnvironmentsResources';
import { EnvironmentOption } from '../utils';

import EnvironmentSelectOption from './EnvironmentSelectOption';

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

  const [isOpen, setOpen] = useState(false);

  const {
    configMaps,
    error: loadError,
    loaded,
    secrets,
    serviceAccounts,
  } = useEnvironmentsResources(namespace);

  const onFilter = useCallback(
    (event: ChangeEvent<HTMLInputElement>, value: string): ReactElement[] => {
      const filteredSecrets = secrets
        ?.filter((secret) => secret.metadata.name.includes(value))
        ?.map((secret) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
            key={secret.metadata.name}
            kind={EnvironmentKind.secret}
            name={secret.metadata.name}
          />
        ));

      const filteredConfigMaps = configMaps
        ?.filter((configMap) => configMap.metadata.name.includes(value))
        ?.map((configMap) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
            key={configMap.metadata.name}
            kind={EnvironmentKind.configMap}
            name={configMap.metadata.name}
          />
        ));

      const filteredServiceAccounts = serviceAccounts
        ?.filter((serviceAccount) => serviceAccount.metadata.name.includes(value))
        ?.map((serviceAccount) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
            key={serviceAccount.metadata.name}
            kind={EnvironmentKind.serviceAccount}
            name={serviceAccount.metadata.name}
          />
        ));

      return [...filteredSecrets, ...filteredConfigMaps, ...filteredServiceAccounts];
    },
    [configMaps, environmentNamesSelected, secrets, serviceAccounts],
  );

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

  return (
    <Select
      onSelect={(event, selection: EnvironmentOption) => {
        onChange(diskName, selection.getName(), serial, selection.getKind());
        setOpen(false);
      }}
      toggleIcon={
        kind ? (
          <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
        ) : null
      }
      aria-labelledby="environment-name-header"
      hasInlineFilter
      isOpen={isOpen}
      maxHeight={400}
      menuAppendTo="parent"
      onFilter={onFilter}
      onToggle={(_, isExpanded) => setOpen(isExpanded)}
      placeholderText={t('Select a resource')}
      selections={new EnvironmentOption(environmentName, kind)}
      variant={SelectVariant.single}
    >
      <SelectGroup key="group1" label={t('Secrets')}>
        {secrets.map((secret) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
            key={secret.metadata.name}
            kind={EnvironmentKind.secret}
            name={secret.metadata.name}
          />
        ))}
      </SelectGroup>
      <Divider key="divider1" />
      <SelectGroup key="group2" label={t('Config Maps')}>
        {configMaps.map((configMap) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
            key={configMap.metadata.name}
            kind={EnvironmentKind.configMap}
            name={configMap.metadata.name}
          />
        ))}
      </SelectGroup>
      <Divider key="divider2" />
      <SelectGroup key="group3" label={t('Service Accounts')}>
        {serviceAccounts.map((serviceAccount) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
            key={serviceAccount.metadata.name}
            kind={EnvironmentKind.serviceAccount}
            name={serviceAccount.metadata.name}
          />
        ))}
      </SelectGroup>
    </Select>
  );
};

export default EnvironmentSelectResource;
