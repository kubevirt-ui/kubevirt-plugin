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

import './DescriptionItem.scss';

type DescriptionItemProps = {
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
  'data-test-id'?: string;
};

const DescriptionItem: React.FC<DescriptionItemProps> = ({
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
        <Flex className="description-item__title">
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
      {isEdit && !showEditOnTitle ? (
        description
      ) : (
        <DescriptionListDescription data-test-id={testId}>
          {descriptionData}
        </DescriptionListDescription>
      )}
    </DescriptionListGroup>
  );
};

export default DescriptionItem;
