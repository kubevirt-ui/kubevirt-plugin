import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type HardwareDeviceTitleProps = {
  canEdit: boolean;
  hideEdit?: boolean;
  onClick?: () => void;
  title: string;
};

const HardwareDeviceTitle: FC<HardwareDeviceTitleProps> = ({
  canEdit,
  hideEdit = false,
  onClick,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  if (hideEdit) return <DescriptionListTerm>{title}</DescriptionListTerm>;

  return (
    <DescriptionListTerm>
      <Button
        className="pf-m-link--align-left"
        isDisabled={!canEdit}
        isInline
        isLarge
        onClick={onClick}
        variant="link"
      >
        {title}
        <PencilAltIcon alt={t('Edit')} className="co-icon-space-l pf-c-button-icon--plain" />
      </Button>
    </DescriptionListTerm>
  );
};

export default HardwareDeviceTitle;
