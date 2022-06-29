import * as React from 'react';
import { useParams } from 'react-router-dom';

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
  selectedSysprepName: string;
  onSelectSysprep: (secretName: string) => void;
  id?: string;
};

const SelectSysprep: React.FC<SelectSysprepProps> = ({
  selectedSysprepName,
  onSelectSysprep,
  id,
}) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();
  const [isSecretSelectOpen, setSecretSelectOpen] = React.useState(false);

  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchResource<
    IoK8sApiCoreV1Secret[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    namespaced: true,
    isList: true,
    namespace,
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
        <ResourceLink kind={ConfigMapModel.kind} name={sysprep?.metadata?.name} linkTo={false} />
      </SelectOption>
    )) as React.ReactElement[];
  };

  const onSelect = (event, newValue) => {
    onSelectSysprep(newValue);
    setSecretSelectOpen(false);
  };

  if (configmapsError)
    return (
      <Alert title={t('Error')} isInline variant={AlertVariant.danger}>
        {configmapsError?.message}
      </Alert>
    );

  return (
    <>
      {configmapsLoaded ? (
        <Select
          menuAppendTo="parent"
          isOpen={isSecretSelectOpen}
          onToggle={() => setSecretSelectOpen(!isSecretSelectOpen)}
          onSelect={onSelect}
          variant={SelectVariant.single}
          onFilter={filterSecrets}
          hasInlineFilter
          selections={selectedSysprepName}
          placeholderText={t('--- Select sysprep ---')}
          maxHeight={400}
          id={id || 'select-sysprep'}
        >
          {sysprepConfigMaps?.map((sysprep) => (
            <SelectOption key={sysprep?.metadata?.name} value={sysprep?.metadata?.name}>
              <ResourceLink
                kind={ConfigMapModel.kind}
                name={sysprep?.metadata?.name}
                linkTo={false}
              />
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
      {selectedSysprepName && (
        <Button variant={ButtonVariant.link} isDanger onClick={() => onSelectSysprep(undefined)}>
          {t('Detach sysprep')}
        </Button>
      )}
    </>
  );
};

export default SelectSysprep;
