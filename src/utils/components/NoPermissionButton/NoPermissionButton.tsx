import React, { type FC, type PropsWithChildren } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Tooltip } from '@patternfly/react-core';

type NoPermissionButtonProps = PropsWithChildren;

const NoPermissionButton: FC<NoPermissionButtonProps> = ({ children }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t(
        'To perform this action you must get permission from your organization administrator.',
      )}
    >
      <Button isAriaDisabled>{children}</Button>
    </Tooltip>
  );
};

export default NoPermissionButton;
