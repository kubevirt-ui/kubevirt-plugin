import React from 'react';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
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

import { useDataImportCronActionsProvider } from '../hooks/useDataImportCronActions';

import './DataImportCronActions.scss';

type DataImportCronActionProps = {
  dataImportCron: V1beta1DataImportCron;
  isKebabToggle?: boolean;
};

const DataImportCronActions: React.FC<DataImportCronActionProps> = ({
  dataImportCron,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [actions, onLazyOpen] = useDataImportCronActionsProvider(dataImportCron);

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
      data-test-id="data-import-cron-actions"
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

export default DataImportCronActions;
