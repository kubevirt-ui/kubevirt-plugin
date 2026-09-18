import { type FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';
import useSysprepConfigMaps from './hooks/useConfigMaps';
import { getSysprepSelectOptions } from './utils';

type SelectSysprepProps = {
  cluster?: string;
  id?: string;
  namespace: string;
  onSelectSysprep: (secretName: string) => void;
  selectedSysprepName: string;
};

const SelectSysprep: FC<SelectSysprepProps> = ({
  cluster,
  id,
  namespace,
  onSelectSysprep,
  selectedSysprepName,
}) => {
  const { t } = useKubevirtTranslation();
  const [sysprepConfigMaps, configmapsLoaded, configmapsError] = useSysprepConfigMaps(
    namespace,
    cluster,
  );

  const options = useMemo(
    () => getSysprepSelectOptions(sysprepConfigMaps, selectedSysprepName),
    [selectedSysprepName, sysprepConfigMaps],
  );

  if (configmapsError)
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {configmapsError?.message}
      </Alert>
    );

  return configmapsLoaded ? (
    <InlineFilterSelect
      options={options}
      placeholder={t('Select sysprep')}
      selected={selectedSysprepName}
      setSelected={onSelectSysprep}
      toggleProps={{ id, isFullWidth: true }}
    />
  ) : (
    <Loading />
  );
};

export default SelectSysprep;
