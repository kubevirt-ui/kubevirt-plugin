import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type WizardDescriptionItemProps = {
  /** title */
  title: string;
  /** description */
  description?: React.ReactNode;
  /** date-test-id of the description group */
  testId?: string;
  /** is the description group editable */
  isEdit?: boolean;
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
    header: React.ReactNode;
    content: React.ReactNode;
  };
  /** additional className */
  className?: string;
};

export const WizardDescriptionItem: React.FC<WizardDescriptionItemProps> = React.memo(
  ({
    title,
    description,
    isDisabled,
    isEdit,
    helperPopover,
    testId,
    count,
    className,
    onEditClick,
    onTitleClick,
  }) => {
    const { t } = useKubevirtTranslation();
    const titleWithCount = title.concat(count ? ` (${count})` : '');

    return (
      <DescriptionListGroup className={className}>
        <DescriptionListTermHelpText>
          {onTitleClick ? (
            <Button isInline isDisabled={isDisabled} onClick={onTitleClick} variant="link">
              <DescriptionListTerm>{titleWithCount}</DescriptionListTerm>
            </Button>
          ) : helperPopover ? (
            <Popover headerContent={helperPopover?.header} bodyContent={helperPopover?.content}>
              <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
            </Popover>
          ) : (
            <DescriptionListTerm>{titleWithCount}</DescriptionListTerm>
          )}
        </DescriptionListTermHelpText>
        {isEdit ? (
          <Button
            data-test-id={testId}
            type="button"
            isInline
            isDisabled={isDisabled}
            onClick={onEditClick}
            variant="link"
          >
            {description ?? <span className="text-muted">{t('Not available')}</span>}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <DescriptionListDescription data-test-id={testId}>
            {description ?? <span className="text-muted">{t('Not available')}</span>}
          </DescriptionListDescription>
        )}
      </DescriptionListGroup>
    );
  },
);
WizardDescriptionItem.displayName = 'WizardDescriptionItem';
