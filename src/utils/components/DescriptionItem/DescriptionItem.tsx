import * as React from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { DescriptionItemHeader } from './DescriptionItemHeader';

import './DescriptionItem.scss';

type DescriptionItemProps = {
  bodyContent?: React.ReactNode;
  breadcrumb?: string;
  'data-test-id'?: string;
  descriptionData: React.ReactNode;
  descriptionHeader?: string;
  isDisabled?: boolean;
  isEdit?: boolean;
  isPopover?: boolean;
  moreInfoURL?: string;
  onEditClick?: () => void;
  showEditOnTitle?: boolean;
};

const DescriptionItem: React.FC<DescriptionItemProps> = ({
  bodyContent,
  breadcrumb,
  'data-test-id': testId,
  descriptionData,
  descriptionHeader,
  isDisabled,
  isEdit,
  isPopover,
  moreInfoURL,
  onEditClick,
  showEditOnTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Flex className="description-item__title">
          <FlexItem>
            {
              <DescriptionItemHeader
                bodyContent={bodyContent}
                breadcrumb={breadcrumb}
                descriptionHeader={descriptionHeader}
                isPopover={isPopover}
                moreInfoURL={moreInfoURL}
              />
            }
          </FlexItem>
          {isEdit && showEditOnTitle && (
            <FlexItem>
              <Button
                data-test-id={`${testId}-edit`}
                isDisabled={isDisabled}
                isInline
                onClick={onEditClick}
                type="button"
                variant="link"
              >
                {t('Edit')}
                <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
              </Button>
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTermHelpText>
      {isEdit && !showEditOnTitle ? (
        <Button
          data-test-id={testId}
          isDisabled={isDisabled}
          isInline
          onClick={onEditClick}
          type="button"
          variant="link"
        >
          <Flex spaceItems={{ default: 'spaceItemsNone' }}>
            <FlexItem>{descriptionData ?? NotAvailable}</FlexItem>
            <FlexItem>
              <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
            </FlexItem>
          </Flex>
        </Button>
      ) : (
        <DescriptionListDescription data-test-id={testId}>
          {descriptionData}
        </DescriptionListDescription>
      )}
    </DescriptionListGroup>
  );
};

export default DescriptionItem;
