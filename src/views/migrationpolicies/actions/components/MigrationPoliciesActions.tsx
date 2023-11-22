import * as React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import useMigrationPoliciesActionsProvider from '../hooks/useMigrationPoliciesActionsProvider';

type MigrationPoliciesActionsProps = {
  isKebabToggle?: boolean;
  mp: V1alpha1MigrationPolicy;
};

const MigrationPoliciesActions: React.FC<MigrationPoliciesActionsProps> = ({
  isKebabToggle,
  mp,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [actions] = useMigrationPoliciesActionsProvider(mp);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      dropdownItems={actions?.map((action) => (
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
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      data-test-id="migration-policies-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default MigrationPoliciesActions;
