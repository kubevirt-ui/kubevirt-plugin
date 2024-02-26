import React, { FC, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';

import { useDataSourceActionsProvider } from '../hooks/useDataSourceActions';

import './DataSourceActions.scss';

type DataSourceActionProps = {
  dataSource: V1beta1DataSource;
  isKebabToggle?: boolean;
};

const DataSourceActions: FC<DataSourceActionProps> = ({ dataSource, isKebabToggle }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [actions, onLazyOpen] = useDataSourceActionsProvider(dataSource);

  const dsActions = actions.filter((a) => a.id !== 'datasource-action-manage-source');
  const manageAction = actions.find((a) => a.id === 'datasource-action-manage-source');

  const onToggle = () => {
    setIsOpen((prevIsOpen) => {
      if (!prevIsOpen) onLazyOpen();

      return !prevIsOpen;
    });
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
      onOpenChange={(open: boolean) => setIsOpen(open)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={Toggle}
    >
      <DropdownList>
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
        </DropdownGroup>
        <Divider key="divider" />,
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
        </DropdownGroup>
      </DropdownList>
    </Dropdown>
  );
};

export default DataSourceActions;
