import React, { FC, ReactNode } from 'react';

import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
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

import EditButtonWithTooltip from './EditButtonWithTooltip';

import './VirtualMachineDescriptionItem.scss';

type VirtualMachineDescriptionItemProps = {
  descriptionData: any;
  descriptionHeader?: string;
  bodyContent?: ReactNode;
  moreInfoURL?: string;
  isPopover?: boolean;
  breadcrumb?: string;
  isEdit?: boolean;
  onEditClick?: () => void;
  isDisabled?: boolean;
  showEditOnTitle?: boolean;
  editOnTitleJustify?: boolean;
  label?: ReactNode;
  'data-test-id'?: string;
  messageOnDisabled?: string;
};

const VirtualMachineDescriptionItem: FC<VirtualMachineDescriptionItemProps> = ({
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
  label,
  'data-test-id': testId,
  messageOnDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;

  const description = (
    <EditButtonWithTooltip
      isEditable={!isDisabled}
      onEditClick={onEditClick}
      testId={testId}
      tooltipContent={messageOnDisabled}
    >
      {descriptionData ?? NotAvailable}
    </EditButtonWithTooltip>
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
          <FlexItem>
            <DescriptionItemHeader
              isPopover={isPopover}
              bodyContent={bodyContent}
              moreInfoURL={moreInfoURL}
              breadcrumb={breadcrumb}
              descriptionHeader={descriptionHeader}
              label={label}
            />
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

      <DescriptionListDescription data-test-id={testId}>
        {isEdit && !showEditOnTitle ? description : descriptionData}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default VirtualMachineDescriptionItem;
