import React, { FC, useState } from 'react';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';

import useClusterPreferenceActionsProvider from './hooks/useClusterPreferenceActionsProvider';

type ClusterPreferenceActionsProps = {
  isKebabToggle?: boolean;
  preference: V1alpha2VirtualMachineClusterPreference;
};

const ClusterPreferenceActions: FC<ClusterPreferenceActionsProps> = ({
  isKebabToggle,
  preference,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useClusterPreferenceActionsProvider(preference);

  return (
    <Dropdown
      dropdownItems={actions?.map((action) => (
        <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
      ))}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      data-test-id="virtual-machine-cluster-preference-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default ClusterPreferenceActions;
