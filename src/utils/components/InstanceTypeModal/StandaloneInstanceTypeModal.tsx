import React, { type FC, useMemo } from 'react';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import Loading from '../Loading/Loading';
import InstanceTypeModal from './InstanceTypeModal';
import { type InstanceTypeModalProps } from './utils/types';

const StandaloneInstanceTypeModal: FC<
  Pick<InstanceTypeModalProps, 'isOpen' | 'onClose' | 'onSubmit' | 'vm'>
> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { allInstanceTypes, loaded, loadError } = useInstanceTypesAndPreferences();
  const instanceTypeName = vm?.spec?.instancetype?.name;
  const instanceType = useMemo(
    () => allInstanceTypes.find((iType) => iType.metadata.name === instanceTypeName),
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
