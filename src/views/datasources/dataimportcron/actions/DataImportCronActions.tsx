import React from 'react';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import { useDataImportCronActionsProvider } from '../hooks/useDataImportCronActions';

type DataImportCronActionProps = {
  dataImportCron: V1beta1DataImportCron;
  isKebabToggle?: boolean;
};

const DataImportCronActions: React.FC<DataImportCronActionProps> = ({
  dataImportCron,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const actions = useDataImportCronActionsProvider(dataImportCron);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action.cta();
    }
    setIsOpen(false);
  };

  return (
    <Dropdown
      data-test-id="data-import-cron-actions"
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

export default DataImportCronActions;
