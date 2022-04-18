import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

type AddAffinityRuleButtonProps = {
  onAffinityClickAdd: () => void;
  isLinkButton?: boolean;
};

const AddAffinityRuleButton: React.FC<AddAffinityRuleButtonProps> = ({
  onAffinityClickAdd,
  isLinkButton,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Button
      icon={isLinkButton && <PlusCircleIcon />}
      className={isLinkButton ? 'pf-m-link--align-left' : ''}
      variant={isLinkButton ? ButtonVariant.link : ButtonVariant.secondary}
      onClick={onAffinityClickAdd}
    >
      {t('Add affinity rule')}
    </Button>
  );
};

export default AddAffinityRuleButton;
