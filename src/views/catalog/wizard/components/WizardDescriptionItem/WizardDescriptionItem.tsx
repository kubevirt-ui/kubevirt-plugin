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
  /** title */
  title: string;
  /** description */
  description?: ReactNode;
  /** date-test-id of the description group */
  testId?: string;
  /** is the description group editable */
  isEdit?: boolean;
  /** show edit button besides title */
  showEditOnTitle?: boolean;
  /** onClick callback for the edit button */
  onEditClick?: () => void;
  /** disabled state of the description group */
  isDisabled?: boolean;
  /** count of items in the description list */
  count?: number | string;
  /** onClick callback for the title */
  onTitleClick?: () => void;
  /** helper popover. the popover will not be available if onTitleClick is present */
  helperPopover?: {
    header: ReactNode;
    content: ReactNode;
  };
  /** additional className */
  className?: string;
  label?: ReactNode;
};

export const WizardDescriptionItem: FC<WizardDescriptionItemProps> = React.memo(
  ({
    title,
    description,
    isDisabled,
    isEdit,
    showEditOnTitle,
    helperPopover,
    testId,
    count,
    className,
    label,
    onEditClick,
    onTitleClick,
  }) => {
    const { t } = useKubevirtTranslation();
    const titleWithCount = title.concat(count ? ` (${count})` : '');
    const getItemHeader = () => {
      if (onTitleClick)
        return (
          <Button isInline isDisabled={isDisabled} onClick={onTitleClick} variant="link">
            <DescriptionListTerm>{titleWithCount}</DescriptionListTerm>
          </Button>
        );

      if (helperPopover) {
        return (
          <Popover headerContent={helperPopover?.header} bodyContent={helperPopover?.content}>
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
                  type="button"
                  isInline
                  isDisabled={isDisabled}
                  onClick={onEditClick}
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
              type="button"
              isInline
              isDisabled={isDisabled}
              onClick={onEditClick}
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
