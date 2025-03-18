import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import SearchItem from '../SearchItem/SearchItem';

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
        icon={<PencilAltIcon alt={t('Edit')} />}
        iconPosition="end"
        isDisabled={!canEdit}
        isInline
        onClick={onClick}
        variant={ButtonVariant.link}
      >
        <SearchItem id={title.replace(' ', '-')}>{title}</SearchItem>
      </Button>
    </DescriptionListTerm>
  );
};

export default HardwareDeviceTitle;
