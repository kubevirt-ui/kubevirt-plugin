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
      menuAppendTo={getContentScrollableElement}
      data-test-id="data-source-actions"
      className="kubevirt-data-source-actions"
      isGrouped
      isPlain={isKebabToggle}
      isOpen={isOpen}
      position={DropdownPosition.right}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={onDropDownToggle} />
        ) : (
          <DropdownToggle onToggle={onDropDownToggle}>{t('Actions')}</DropdownToggle>
        )
      }
      dropdownItems={[
        <DropdownGroup label={t('DataSource')} key="datasource-actions">
          {dsActions?.map((action) => (
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
        </DropdownGroup>,
        <DropdownGroup label={t('DataImportCron')} key="datasource-manage">
          <DropdownItem
            data-test-id="datasource-manage"
            key="datasource-manage"
            onClick={() => handleClick(manageAction)}
            isDisabled={manageAction?.disabled}
            description={manageAction?.description}
          >
            {manageAction?.label}
          </DropdownItem>
        </DropdownGroup>,
      ]}
    />
  );
};

export default DataSourceActions;
