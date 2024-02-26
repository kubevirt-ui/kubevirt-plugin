import React, { FC } from 'react';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import { useDataImportCronActionsProvider } from '../hooks/useDataImportCronActions';

import './DataImportCronActions.scss';

type DataImportCronActionProps = {
  dataImportCron: V1beta1DataImportCron;
  isKebabToggle?: boolean;
};

const DataImportCronActions: FC<DataImportCronActionProps> = ({
  dataImportCron,
  isKebabToggle,
}) => {
  const [actions, onLazyOpen] = useDataImportCronActionsProvider(dataImportCron);

  return (
    <ActionsDropdown
      actions={actions}
      id="data-import-cron-actions"
      isKebabToggle={isKebabToggle}
      onLazyClick={onLazyOpen}
    />
  );
};

export default DataImportCronActions;
