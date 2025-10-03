import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import {
  getEnvironmentOptionKind,
  getEnvironmentOptionName,
  getEnvironmentOptionValue,
} from '../utils';

type EnvironmentSelectResourceProps = {
  diskName: string;
  environmentName?: string;
  kind?: EnvironmentKind;
  loaded: boolean;
  loadError: any;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  selectOptions: EnhancedSelectOptionProps[];
  serial: string;
};

const EnvironmentSelectResource: FC<EnvironmentSelectResourceProps> = ({
  diskName,
  environmentName,
  kind,
  loaded,
  loadError,
  onChange,
  selectOptions,
  serial,
}) => {
  const { t } = useKubevirtTranslation();

  if (!loaded) return <Loading />;

  if (loadError)
    return (
      <Alert
        className="co-alert--scrollable"
        isInline
        title={t('An error occurred')}
        variant={AlertVariant.danger}
      >
        <div className="co-pre-line">{loadError?.message}</div>
      </Alert>
    );

  const onSelect = (value: string) => {
    onChange(diskName, getEnvironmentOptionName(value), serial, getEnvironmentOptionKind(value));
  };

  const selectedValue = getEnvironmentOptionValue(environmentName, kind);

  return (
    <InlineFilterSelect
      toggleProps={{
        children: environmentName ?? t('Select a resource'),
        icon: kind ? (
          <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
        ) : null,
      }}
      options={selectOptions}
      selected={selectedValue}
      selectProps={{ 'aria-labelledby': 'environment-name-header' }}
      setSelected={onSelect}
    />
  );
};

export default EnvironmentSelectResource;
