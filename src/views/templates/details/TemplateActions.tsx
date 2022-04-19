import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, DropdownToggle } from '@patternfly/react-core';

import useVirtualMachineTemplatesActions from '../actions/hooks/useVirtualMachineTemplatesActions';

type TemplateActionsProps = {
  template: V1Template;
};

const TemplateActions: React.FC<TemplateActionsProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const [isDropDownOpen, setDropdownOpen] = React.useState(false);

  const actions = useVirtualMachineTemplatesActions(template).filter(
    (action) => action.id !== 'edit-template',
  );

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setDropdownOpen(false);
    }
  };

  return (
    <Dropdown
      isOpen={isDropDownOpen}
      position={DropdownPosition.right}
      toggle={<DropdownToggle onToggle={setDropdownOpen}>{t('Actions')}</DropdownToggle>}
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
          description={action?.disabled && action?.description}
        >
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default TemplateActions;
