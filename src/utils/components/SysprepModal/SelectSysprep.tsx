import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';

import useSysprepConfigMaps from './hooks/useConfigMaps';

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
  const [sysprepConfigMaps, configmapsLoaded, configmapsError] = useSysprepConfigMaps(namespace);

  if (configmapsError)
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {configmapsError?.message}
      </Alert>
    );

  return (
    <>
      {configmapsLoaded ? (
        <InlineFilterSelect
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
