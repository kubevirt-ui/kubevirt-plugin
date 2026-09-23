import { type FC } from 'react';

import EditButton from '@kubevirt-utils/components/EditButton/EditButton';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

import { type CalculationMethodContentMapper } from '../types';

import EditCalculationMethodModal from './EditCalculationMethodModal';

import './EditCalculationMethodButton.scss';

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
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onClick = (): void => {
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

  return (
    <Popover
      bodyContent={t('Edit quota calculation method')}
      className="edit-calculation-method-button__popover"
      hasAutoWidth
      position={PopoverPosition.right}
      triggerAction="hover"
    >
      <EditButton onClick={onClick} variant={ButtonVariant.link} />
    </Popover>
  );
};

export default EditCalculationMethodButton;
