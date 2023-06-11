import * as React from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import { AUTOUNATTEND, UNATTEND } from './sysprep-utils';

type SelectSysprepProps = {
  id?: string;
  namespace: string;
  onSelectSysprep: (secretName: string) => void;
  selectedSysprepName: string;
};

const SelectSysprep: React.FC<SelectSysprepProps> = ({
  id,
  namespace,
  onSelectSysprep,
  selectedSysprepName,
}) => {
  const { t } = useKubevirtTranslation();
  const [isSecretSelectOpen, setSecretSelectOpen] = React.useState(false);

  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchResource<
    IoK8sApiCoreV1Secret[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const sysprepConfigMaps = configmaps?.filter(
    (configmap) => configmap?.data?.[AUTOUNATTEND] || configmap?.data?.[UNATTEND],
  );

  const filterSecrets = (_, value: string): React.ReactElement[] => {
    let filteredSecrets = sysprepConfigMaps;

    if (value) {
      const regex = new RegExp(value, 'i');
      filteredSecrets = sysprepConfigMaps.filter((secret) => regex.test(secret?.metadata?.name));
    }

    return filteredSecrets.map((sysprep) => (
      <SelectOption key={sysprep?.metadata?.name} value={sysprep?.metadata?.name}>
        <ResourceLink kind={ConfigMapModel.kind} linkTo={false} name={sysprep?.metadata?.name} />
      </SelectOption>
    )) as React.ReactElement[];
  };

  const onSelect = (event, newValue) => {
    onSelectSysprep(newValue);
    setSecretSelectOpen(false);
  };

  if (configmapsError)
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {configmapsError?.message}
      </Alert>
    );

  return (
    <>
      {configmapsLoaded ? (
        <Select
          hasInlineFilter
          id={id || 'select-sysprep'}
          isOpen={isSecretSelectOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={filterSecrets}
          onSelect={onSelect}
          onToggle={() => setSecretSelectOpen(!isSecretSelectOpen)}
          placeholderText={t('--- Select sysprep ---')}
          selections={selectedSysprepName}
          variant={SelectVariant.single}
        >
          {sysprepConfigMaps?.map((sysprep) => (
            <SelectOption key={sysprep?.metadata?.name} value={sysprep?.metadata?.name}>
              <ResourceLink
                kind={ConfigMapModel.kind}
                linkTo={false}
                name={sysprep?.metadata?.name}
              />
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
      {selectedSysprepName && (
        <Button isDanger onClick={() => onSelectSysprep(undefined)} variant={ButtonVariant.link}>
          {t('Detach sysprep')}
        </Button>
      )}
    </>
  );
};

export default SelectSysprep;
