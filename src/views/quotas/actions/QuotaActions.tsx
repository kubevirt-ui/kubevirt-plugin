import React, { FC, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { ApplicationAwareQuota } from '../form/types';

import { useQuotaActions } from './useQuotaActions';

type QuotaActionProps = {
  isKebabToggle?: boolean;
  quota: ApplicationAwareQuota;
};

const QuotaActions: FC<QuotaActionProps> = ({ isKebabToggle, quota }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const actions = useQuotaActions(quota);

  const onToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const Toggle = isKebabToggle
    ? KebabToggle({ isExpanded: isOpen, onClick: onToggle })
    : DropdownToggle({ children: t('Actions'), isExpanded: isOpen, onClick: onToggle });

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action.cta();
    }
    setIsOpen(false);
  };

  return (
    <Dropdown
      className="kubevirt-data-source-actions"
      data-test-id="data-source-actions"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={Toggle}
    >
      <DropdownList>
        {actions?.map((action) => (
          <DropdownItem
            data-test-id={action?.id}
            description={action?.description}
            isDisabled={action?.disabled}
            key={action?.id}
            onClick={() => handleClick(action)}
          >
            {action?.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default QuotaActions;
