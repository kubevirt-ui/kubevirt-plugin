import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
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

type WizardDescriptionItemProps = {
  /** additional className */
  className?: string;
  /** count of items in the description list */
  count?: number | string;
  /** description */
  description?: ReactNode;
  /** helper popover. the popover will not be available if onTitleClick is present */
  helperPopover?: {
    content: ReactNode;
    header: ReactNode;
  };
  /** disabled state of the description group */
  isDisabled?: boolean;
  /** is the description group editable */
  isEdit?: boolean;
  label?: ReactNode;
  /** onClick callback for the edit button */
  onEditClick?: () => void;
  /** onClick callback for the title */
  onTitleClick?: () => void;
  /** show edit button besides title */
  showEditOnTitle?: boolean;
  /** date-test-id of the description group */
  testId?: string;
  /** title */
  title: string;
};

export const WizardDescriptionItem: FC<WizardDescriptionItemProps> = React.memo(
  ({
    className,
    count,
    description,
    helperPopover,
    isDisabled,
    isEdit,
    label,
    onEditClick,
    onTitleClick,
    showEditOnTitle,
    testId,
    title,
  }) => {
    const { t } = useKubevirtTranslation();
    const titleWithCount = title.concat(count ? ` (${count})` : '');
    const getItemHeader = () => {
      if (onTitleClick)
        return (
          <Button isDisabled={isDisabled} isInline onClick={onTitleClick} variant="link">
            <DescriptionListTerm>{titleWithCount}</DescriptionListTerm>
          </Button>
        );

      if (helperPopover) {
        return (
          <Popover bodyContent={helperPopover?.content} headerContent={helperPopover?.header}>
            <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
          </Popover>
        );
      }

      return (
        <DescriptionListTerm>
          {titleWithCount} {label}
        </DescriptionListTerm>
      );
    };

    return (
      <DescriptionListGroup className={className}>
        <DescriptionListTermHelpText>
          <Flex
            className="wizard-description-item__title"
            justifyContent={{ default: 'justifyContentFlexStart' }}
          >
            <FlexItem>{getItemHeader()}</FlexItem>
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
          <DescriptionListDescription>
            <Button
              data-test-id={`${testId}-edit`}
              isDisabled={isDisabled}
              isInline
              onClick={onEditClick}
              type="button"
              variant="link"
            >
              {description ?? <span className="text-muted">{t('Not available')}</span>}
              <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
            </Button>
          </DescriptionListDescription>
        ) : (
          <div data-test-id={testId}>
            <DescriptionListDescription>
              {description ?? <span className="text-muted">{t('Not available')}</span>}
            </DescriptionListDescription>
          </div>
        )}
      </DescriptionListGroup>
    );
  },
);
WizardDescriptionItem.displayName = 'WizardDescriptionItem';
