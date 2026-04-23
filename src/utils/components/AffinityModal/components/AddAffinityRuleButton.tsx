import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

type AddAffinityRuleButtonProps = {
  isLinkButton?: boolean;
  onAffinityClickAdd: () => void;
};

const AddAffinityRuleButton: FC<AddAffinityRuleButtonProps> = ({
  isLinkButton,
  onAffinityClickAdd,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Button
      className={isLinkButton ? 'pf-m-link--align-left' : ''}
      icon={isLinkButton && <PlusCircleIcon />}
      onClick={onAffinityClickAdd}
      variant={isLinkButton ? ButtonVariant.link : ButtonVariant.secondary}
    >
      {t('Add affinity rule')}
    </Button>
  );
};

export default AddAffinityRuleButton;
