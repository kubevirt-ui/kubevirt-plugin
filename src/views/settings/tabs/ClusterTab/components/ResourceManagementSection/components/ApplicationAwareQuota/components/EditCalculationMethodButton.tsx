import React, { FC } from 'react';

import EditButton from '@kubevirt-utils/components/EditButton/EditButton';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

import { CalculationMethodContentMapper } from '../types';

import EditCalculationMethodModal from './EditCalculationMethodModal';

type EditCalculationMethodButtonProps = {
  calculationMethodContentMapper: CalculationMethodContentMapper;
  hyperConverge: HyperConverged;
  selectedCalculationMethod: CalculationMethod;
};

const EditCalculationMethodButton: FC<EditCalculationMethodButtonProps> = ({
  calculationMethodContentMapper,
  hyperConverge,
  selectedCalculationMethod,
}) => {
  const { createModal } = useModal();

  const selectedLabel = calculationMethodContentMapper[selectedCalculationMethod]?.label;

  const onClick = () => {
    createModal(({ isOpen, onClose }) => (
      <EditCalculationMethodModal
        calculationMethodContentMapper={calculationMethodContentMapper}
        hyperConverge={hyperConverge}
        initiallySelectedMethod={selectedCalculationMethod}
        isOpen={isOpen}
        onClose={onClose}
      />
    ));
  };

  return <EditButton onClick={onClick}>{selectedLabel}</EditButton>;
};

export default EditCalculationMethodButton;
