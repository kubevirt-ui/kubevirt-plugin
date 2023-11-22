import React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import { useDataSourceActionsProvider } from '../hooks/useDataSourceActions';

import './DataSourceActions.scss';

type DataSourceActionProps = {
  dataSource: V1beta1DataSource;
  isKebabToggle?: boolean;
};

const DataSourceActions: React.FC<DataSourceActionProps> = ({ dataSource, isKebabToggle }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [actions, onLazyOpen] = useDataSourceActionsProvider(dataSource);

  const dsActions = actions.filter((a) => a.id !== 'datasource-action-manage-source');
  const manageAction = actions.find((a) => a.id === 'datasource-action-manage-source');

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action.cta();
    }
    setIsOpen(false);
  };

  const onDropDownToggle = (value: boolean) => {
    setIsOpen(value);
    if (value) onLazyOpen();
  };

  return (
    <Dropdown
      dropdownItems={[
        <DropdownGroup key="datasource-actions" label={t('DataSource')}>
          {dsActions?.map((action) => (
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
        </DropdownGroup>,
        <DropdownSeparator key="dropdown separator" />,
        <DropdownGroup key="datasource-manage" label={t('DataImportCron')}>
          <DropdownItem
            data-test-id="datasource-manage"
            description={manageAction?.description}
            isDisabled={manageAction?.disabled}
            key="datasource-manage"
            onClick={() => handleClick(manageAction)}
          >
            {manageAction?.label}
          </DropdownItem>
        </DropdownGroup>,
      ]}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={onDropDownToggle} />
        ) : (
          <DropdownToggle onToggle={onDropDownToggle}>{t('Actions')}</DropdownToggle>
        )
      }
      className="kubevirt-data-source-actions"
      data-test-id="data-source-actions"
      isGrouped
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default DataSourceActions;
