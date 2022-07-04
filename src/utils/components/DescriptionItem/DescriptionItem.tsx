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

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Flex className="description-item__title">
          <FlexItem>
            {
              <DescriptionItemHeader
                isPopover={isPopover}
                bodyContent={bodyContent}
                moreInfoURL={moreInfoURL}
                breadcrumb={breadcrumb}
                descriptionHeader={descriptionHeader}
              />
            }
          </FlexItem>
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
      ) : (
        <DescriptionListDescription data-test-id={testId}>
          {descriptionData}
        </DescriptionListDescription>
      )}
    </DescriptionListGroup>
  );
};

export default DescriptionItem;
