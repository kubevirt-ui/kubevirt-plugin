import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import MutedTextDiv from '../MutedTextDiv/MutedTextDiv';

type VirtualMachineDescriptionItemProps = {
  descriptionData: any;
  descriptionHeader?: string;
  bodyContent?: React.ReactNode;
  moreInfoURL?: string;
  isPopover?: boolean;
  breadcrumb?: string;
  isEdit?: boolean;
  onEditClick?: () => void;
  isDisabled?: boolean;
};

const VirtualMachineDescriptionItem: React.FC<VirtualMachineDescriptionItemProps> = ({
  descriptionData,
  descriptionHeader,
  bodyContent,
  moreInfoURL,
  isPopover,
  breadcrumb,
  isEdit,
  onEditClick,
  isDisabled,
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

  const description = (
    <Button type="button" isInline isDisabled={isDisabled} onClick={onEditClick} variant="link">
      {descriptionData ?? <MutedTextDiv text={t('Not available')} />}
      <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
    </Button>
  );
  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        {isPopover ? popover : descriptionHeader}
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        {isEdit ? description : descriptionData}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default VirtualMachineDescriptionItem;
