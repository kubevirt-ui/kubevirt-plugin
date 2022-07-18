import React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
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

import { useDataSourceActionsProvider } from '../hooks/useDataSourceActions';

type DataSourceActionProps = {
  dataSource: V1beta1DataSource;
  isKebabToggle?: boolean;
};

const DataSourceActions: React.FC<DataSourceActionProps> = ({ dataSource, isKebabToggle }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const actions = useDataSourceActionsProvider(dataSource);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action.cta();
    }
    setIsOpen(false);
  };

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      data-test-id="data-source-actions"
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
        <DropdownItem
          data-test-id={action?.id}
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
          description={action?.description}
        >
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default DataSourceActions;
