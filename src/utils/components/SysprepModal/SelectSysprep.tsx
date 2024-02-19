import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import FilterSelect from '../FilterSelect/FilterSelect';
import Loading from '../Loading/Loading';

import { AUTOUNATTEND, UNATTEND } from './sysprep-utils';

type SelectSysprepProps = {
  id?: string;
  namespace: string;
  onSelectSysprep: (secretName: string) => void;
  selectedSysprepName: string;
};

const SelectSysprep: FC<SelectSysprepProps> = ({
  id,
  namespace,
  onSelectSysprep,
  selectedSysprepName,
}) => {
  const { t } = useKubevirtTranslation();
  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const sysprepConfigMaps = configmaps?.filter(
    (configmap) => configmap?.data?.[AUTOUNATTEND] || configmap?.data?.[UNATTEND],
  );

  if (configmapsError)
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {configmapsError?.message}
      </Alert>
    );

  return (
    <>
      {configmapsLoaded ? (
        <FilterSelect
          options={sysprepConfigMaps?.map((configMap) => {
            const name = getName(configMap);
            return {
              children: name,
              groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
              value: name,
            };
          })}
          selected={selectedSysprepName}
          setSelected={onSelectSysprep}
          toggleProps={{ id, placeholder: t('--- Select sysprep ---') }}
        />
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
