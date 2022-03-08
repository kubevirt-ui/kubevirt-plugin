import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type VirtualMachineDescriptionItemProps = {
  descriptionData: any;
  descriptionHeader?: string;
  bodyContent?: React.ReactNode;
  moreInfoURL?: string;
  isPopover?: boolean;
};

const VirtualMachineDescriptionItem: React.FC<VirtualMachineDescriptionItemProps> = ({
  descriptionData,
  descriptionHeader,
  bodyContent,
  moreInfoURL,
  isPopover,
}) => {
  const { t } = useKubevirtTranslation();

  const popover = (
    <Popover
      headerContent={descriptionHeader}
      bodyContent={
        <>
          {bodyContent}
          {moreInfoURL && <Link to={moreInfoURL}>{t('Learn more')}</Link>}
        </>
      }
    >
      <DescriptionListTermHelpTextButton>{descriptionHeader}</DescriptionListTermHelpTextButton>
    </Popover>
  );
  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        {isPopover ? popover : descriptionHeader}
      </DescriptionListTermHelpText>
      <DescriptionListDescription>{descriptionData}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default VirtualMachineDescriptionItem;
