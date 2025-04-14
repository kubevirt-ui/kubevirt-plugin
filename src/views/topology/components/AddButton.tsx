import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export type AddButtonProps = {
  btnText?: string;
  isDisabled?: boolean;
  onClick: () => void;
};

const AddButton: FC<AddButtonProps> = ({ btnText, isDisabled, onClick }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Button
      className="pf-m-link--align-left"
      icon={<PlusCircleIcon />}
      isDisabled={isDisabled}
      onClick={onClick}
      variant="link"
    >
      {btnText || t('Add')}
    </Button>
  );
};

export default AddButton;
