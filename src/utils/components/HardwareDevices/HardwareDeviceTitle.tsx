import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type HardwareDeviceTitleProps = {
  title: string;
  canEdit: boolean;
  hideEdit?: boolean;
  onClick?: () => void;
};

const HardwareDeviceTitle: FC<HardwareDeviceTitleProps> = ({
  title,
  canEdit,
  hideEdit = false,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();

  if (hideEdit) return <DescriptionListTerm>{title}</DescriptionListTerm>;

  return (
    <DescriptionListTerm>
      <Button
        isInline
        variant="link"
        onClick={onClick}
        isDisabled={!canEdit}
        className="pf-m-link--align-left"
        isLarge
      >
        {title}
        <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" alt={t('Edit')} />
      </Button>
    </DescriptionListTerm>
  );
};

export default HardwareDeviceTitle;
