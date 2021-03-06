import * as React from 'react';
import { Link } from 'react-router-dom';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import './VirtualMachineDescriptionItem.scss';

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
  showEditOnTitle?: boolean;
  editOnTitleJustify?: boolean;
  'data-test-id'?: string;
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
  showEditOnTitle,
  editOnTitleJustify = false,
  'data-test-id': testId,
}) => {
  const { t } = useKubevirtTranslation();
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;

  const getItemHeader = () => {
    if (isPopover && bodyContent) {
      return (
        <Popover
          headerContent={descriptionHeader}
          bodyContent={
            <>
              {bodyContent}
              {moreInfoURL && (
                <>
                  {t('More info: ')}
                  <Link to={moreInfoURL}>{moreInfoURL}</Link>
                </>
              )}
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
          <DescriptionListTermHelpTextButton>
            {' '}
            {descriptionHeader}{' '}
          </DescriptionListTermHelpTextButton>
        </Popover>
      );
    }

    return <DescriptionListTerm>{descriptionHeader}</DescriptionListTerm>;
  };

  const description = (
    <Button
      type="button"
      isInline
      isDisabled={isDisabled}
      onClick={onEditClick}
      variant="link"
      data-test-id={testId}
    >
      <Flex spaceItems={{ default: 'spaceItemsNone' }}>
        <FlexItem>{descriptionData ?? NotAvailable}</FlexItem>
        <FlexItem>
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </FlexItem>
      </Flex>
    </Button>
  );

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Flex
          className="vm-description-item__title"
          justifyContent={{
            default: editOnTitleJustify ? 'justifyContentSpaceBetween' : 'justifyContentFlexStart',
          }}
        >
          <FlexItem>{getItemHeader()}</FlexItem>
          {isEdit && showEditOnTitle && (
            <FlexItem>
              <Button
                type="button"
                isInline
                isDisabled={isDisabled}
                onClick={onEditClick}
                variant="link"
                data-test-id={`${testId}-edit`}
              >
                {t('Edit')}
                <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
              </Button>
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTermHelpText>

      <DescriptionListDescription data-test-id={testId}>
        {isEdit && !showEditOnTitle ? description : descriptionData}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default VirtualMachineDescriptionItem;
