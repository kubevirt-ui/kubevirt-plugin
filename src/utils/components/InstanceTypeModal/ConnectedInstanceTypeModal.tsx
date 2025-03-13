import React, { FC } from 'react';

import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import Loading from '../Loading/Loading';

import InstanceTypeModal, { InstanceTypeModalProps } from './InstanceTypeModal';

const ConnectedInstanceTypeModal: FC<
  Pick<InstanceTypeModalProps, 'instanceTypeVM' | 'isOpen' | 'onClose' | 'onSubmit'>
> = ({ instanceTypeVM, ...otherProps }) => {
  const { allInstanceTypes, loaded, loadError } = useInstanceTypesAndPreferences();
  const instanceType = allInstanceTypes.find(
    (it) => it.metadata.name === instanceTypeVM?.spec?.instancetype?.name,
  );
  return (
    <>
      {!loaded && <Loading />}
      {loaded && loadError && <ErrorAlert error={loadError} />}
      {loaded && !loadError && (
        <InstanceTypeModal
          {...otherProps}
          allInstanceTypes={allInstanceTypes}
          instanceType={instanceType}
          instanceTypeVM={instanceTypeVM}
        />
      )}
    </>
  );
};

export default ConnectedInstanceTypeModal;
