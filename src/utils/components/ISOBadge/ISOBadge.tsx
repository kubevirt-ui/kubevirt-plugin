import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, Popover, PopoverPosition } from '@patternfly/react-core';

type ISOBadgeProps = {
  name: string;
};

const ISOBadge: FC<ISOBadgeProps> = ({ name }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Popover
      bodyContent={name}
      hasAutoWidth
      position={PopoverPosition.top}
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- keep hover UX until Popover trigger migration
      triggerAction="hover"
    >
      <Badge isRead>{t('ISO')}</Badge>
    </Popover>
  );
};

export default ISOBadge;
