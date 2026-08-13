import React, { type FC, type ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import { DescriptionItemHeader } from '@kubevirt-utils/components/DescriptionItem/DescriptionItemHeader';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type OLSPromptType } from '@lightspeed/utils/prompts';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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

import './DescriptionItem.scss';

type DescriptionItemProps = {
  additionalContent?: ReactNode;
  bodyContent?: ReactNode;
  breadcrumb?: string;
  className?: string;
  'data-test'?: string;
  descriptionData: ReactNode;
  descriptionHeader?: ReactNode;
  isDisabled?: boolean;
  isEdit?: boolean;
  isLabelEditor?: boolean;
  isPopover?: boolean;
  isRequired?: boolean;
  label?: ReactNode;
  messageOnDisabled?: string;
  moreInfoURL?: string;
  olsObj?: K8sResourceCommon;
  onEditClick?: () => void;
  promptType?: OLSPromptType;
  showEditOnTitle?: boolean;
  subTitle?: string;
};

const DescriptionItem: FC<DescriptionItemProps> = ({
  additionalContent,
  bodyContent,
  breadcrumb,
  className,
  'data-test': testId,
  descriptionData,
  descriptionHeader,
  isDisabled,
  isEdit,
  isLabelEditor = false,
  isPopover,
  isRequired = false,
  label,
  messageOnDisabled,
  moreInfoURL,
  olsObj,
  onEditClick,
  promptType,
  showEditOnTitle,
  subTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const description = useMemo(() => {
    if (!isEdit || showEditOnTitle) return descriptionData;
    const fallback = <MutedTextSpan text={t('Not available')} />;
    return (
      <>
        <EditButtonWithTooltip
          isEditable={!isDisabled}
          onEditClick={onEditClick}
          testId={testId}
          tooltipContent={messageOnDisabled}
        >
          {descriptionData ?? fallback}
        </EditButtonWithTooltip>
        {additionalContent}
      </>
    );
  }, [
    descriptionData,
    isDisabled,
    isEdit,
    t,
    onEditClick,
    messageOnDisabled,
    testId,
    additionalContent,
    showEditOnTitle,
  ]);
  const hasHeader =
    bodyContent || breadcrumb || descriptionHeader || isRequired || label || moreInfoURL;

  return (
    <DescriptionListGroup className={className}>
      <DescriptionListTermHelpText>
        <Flex
          className={classNames({ 'pf-v6-u-w-100': isLabelEditor })}
          justifyContent={{
            default: isLabelEditor ? 'justifyContentSpaceBetween' : 'justifyContentFlexStart',
          }}
        >
          {hasHeader && (
            <FlexItem>
              <DescriptionItemHeader
                bodyContent={bodyContent}
                breadcrumb={breadcrumb}
                descriptionHeader={descriptionHeader}
                isPopover={isPopover}
                isRequired={isRequired}
                label={label}
                moreInfoURL={moreInfoURL}
                olsObj={olsObj}
                promptType={promptType}
              />
            </FlexItem>
          )}
          {isEdit && showEditOnTitle && (
            <FlexItem>
              <Button
                data-test={`${testId}-edit`}
                icon={<PencilAltIcon />}
                iconPosition="end"
                isDisabled={isDisabled}
                isInline
                onClick={onEditClick}
                type="button"
                variant="link"
              >
                {t('Edit')}
              </Button>
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTermHelpText>
      <DescriptionListDescription
        className={classNames({ 'co-editable-label-group': isLabelEditor })}
        data-test={isEdit && !showEditOnTitle ? undefined : testId}
      >
        {subTitle && <div className="pf-v6-c-description-list__text pf-v6-u-my-sm">{subTitle}</div>}
        {description}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DescriptionItem;
