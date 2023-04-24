import React, { FC, useState } from 'react';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import useClusterPreferenceActionsProvider from './hooks/useClusterPreferenceActionsProvider';

type ClusterPreferenceActionsProps = {
  preference: V1alpha2VirtualMachineClusterPreference;
  isKebabToggle?: boolean;
};

const ClusterPreferenceActions: FC<ClusterPreferenceActionsProps> = ({
  preference,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useClusterPreferenceActionsProvider(preference);

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      data-test-id="virtual-machine-cluster-preference-actions"
      isPlain={isKebabToggle}
      isOpen={isOpen}
      position={DropdownPosition.right}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      dropdownItems={actions?.map((action) => (
        <ActionDropdownItem key={action?.id} action={action} setIsOpen={setIsOpen} />
      ))}
    />
  );
};

export default ClusterPreferenceActions;
