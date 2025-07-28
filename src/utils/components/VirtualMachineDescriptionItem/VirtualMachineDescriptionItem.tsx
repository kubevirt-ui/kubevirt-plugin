import React, { FC, ReactNode } from 'react';

import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
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
  additionalContent?: ReactNode;
  bodyContent?: ReactNode;
  breadcrumb?: string;
  className?: string;
  'data-test-id'?: string;
  descriptionData: any;
  descriptionHeader?: ReactNode;
  editOnTitleJustify?: boolean;
  isDisabled?: boolean;
  isEdit?: boolean;
  isPopover?: boolean;
  label?: ReactNode;
  messageOnDisabled?: string;
  moreInfoURL?: string;
  onEditClick?: () => void;
  showEditOnTitle?: boolean;
  subTitle?: string;
};

const VirtualMachineDescriptionItem: FC<VirtualMachineDescriptionItemProps> = ({
  additionalContent,
  bodyContent,
  breadcrumb,
  className,
  'data-test-id': testId,
  descriptionData,
  descriptionHeader,
  editOnTitleJustify = false,
  isDisabled,
  isEdit,
  isPopover,
  label,
  messageOnDisabled,
  moreInfoURL,
  onEditClick,
  showEditOnTitle,
  subTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;

  const description = (
    <>
      <EditButtonWithTooltip
        isEditable={!isDisabled}
        onEditClick={onEditClick}
        testId={testId}
        tooltipContent={messageOnDisabled}
      >
        {descriptionData ?? NotAvailable}
      </EditButtonWithTooltip>
      {additionalContent}
    </>
  );

  return (
    <DescriptionListGroup className={className}>
      <DescriptionListTermHelpText>
        <Flex
          justifyContent={{
            default: editOnTitleJustify ? 'justifyContentSpaceBetween' : 'justifyContentFlexStart',
          }}
        >
          {(bodyContent || breadcrumb || descriptionHeader || label || moreInfoURL) && (
            <FlexItem>
              <DescriptionItemHeader
                bodyContent={bodyContent}
                breadcrumb={breadcrumb}
                descriptionHeader={descriptionHeader}
                isPopover={isPopover}
                label={label}
                moreInfoURL={moreInfoURL}
              />
            </FlexItem>
          )}
          {isEdit && showEditOnTitle && (
            <FlexItem>
              <Button
                data-test-id={`${testId}-edit`}
                icon={<PencilAltIcon />}
                iconPosition="end"
                isDisabled={isDisabled}
                isInline
                onClick={onEditClick}
                type="button"
                variant={ButtonVariant.link}
              >
                {t('Edit')}
              </Button>
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTermHelpText>

      <DescriptionListDescription data-test-id={testId}>
        {subTitle && <div className="pf-v6-c-description-list__text pf-v6-u-my-sm">{subTitle}</div>}
        {isEdit && !showEditOnTitle ? description : descriptionData}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default VirtualMachineDescriptionItem;
