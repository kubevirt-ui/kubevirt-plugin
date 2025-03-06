import React, { FC, useMemo } from 'react';

import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import Loading from '../Loading/Loading';

import { InstanceTypeModalProps } from './utils/types';
import InstanceTypeModal from './InstanceTypeModal';

const StandaloneInstanceTypeModal: FC<
  Pick<InstanceTypeModalProps, 'isOpen' | 'onClose' | 'onSubmit' | 'vm'>
> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { allInstanceTypes, loaded, loadError } = useInstanceTypesAndPreferences();
  const instanceTypeName = vm?.spec?.instancetype?.name;
  const instanceType = useMemo(
    () => allInstanceTypes.find((it) => it.metadata.name === instanceTypeName),
    [instanceTypeName, allInstanceTypes],
  );

  if (!loaded) {
    return <Loading />;
  }
  if (loadError) {
    return <ErrorAlert error={loadError} />;
  }

  return (
    <InstanceTypeModal
      allInstanceTypes={allInstanceTypes}
      instanceType={instanceType}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default StandaloneInstanceTypeModal;
