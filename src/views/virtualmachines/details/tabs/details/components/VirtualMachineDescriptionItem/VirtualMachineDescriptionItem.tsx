import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
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
  breadcrumb?: string;
};

const VirtualMachineDescriptionItem: React.FC<VirtualMachineDescriptionItemProps> = ({
  descriptionData,
  descriptionHeader,
  bodyContent,
  moreInfoURL,
  isPopover,
  breadcrumb,
}) => {
  const { t } = useKubevirtTranslation();

  const popover = (
    <Popover
      headerContent={descriptionHeader}
      bodyContent={
        <>
          {bodyContent} {t('More info: ')}
          {moreInfoURL && <Link to={moreInfoURL}>{moreInfoURL}</Link>}
          {breadcrumb && (
            <Breadcrumb>
              {breadcrumb.split('.').map((item) => (
                <BreadcrumbItem key={item}>{item}</BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
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
