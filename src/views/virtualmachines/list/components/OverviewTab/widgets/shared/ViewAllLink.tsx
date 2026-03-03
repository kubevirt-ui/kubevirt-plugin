import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

type ViewAllLinkProps = {
  'aria-label'?: string;
  label?: string;
  onClick?: () => void;
};

const ViewAllLink: FC<ViewAllLinkProps> = ({ 'aria-label': ariaLabel, label, onClick }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Button aria-label={ariaLabel} isDisabled={!onClick} onClick={onClick} size="sm" variant="link">
      {label ?? t('View all')}
    </Button>
  );
};

export default ViewAllLink;
