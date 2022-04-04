import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type HardwareDeviceTitleProps = {
  title: string;
  canEdit: boolean;
  onClick?: () => void;
};

const HardwareDeviceTitle: React.FC<HardwareDeviceTitleProps> = ({ title, canEdit, onClick }) => {
  const { t } = useKubevirtTranslation();

  if (!canEdit) return <DescriptionListTerm>{title}</DescriptionListTerm>;
  else
    return (
      <Button isInline variant="link" onClick={onClick} className="pf-m-link--align-left">
        <DescriptionListTerm>
          {title}
          {canEdit && (
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain " alt={t('Edit')} />
          )}
        </DescriptionListTerm>
      </Button>
    );
};

export default HardwareDeviceTitle;
