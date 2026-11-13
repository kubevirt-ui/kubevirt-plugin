import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useDataVolumeActions from './hooks/useDataVolumeActions';

type DataVolumeActionsProps = {
  dataVolume: V1beta1DataVolume;
  isKebabToggle?: boolean;
};

const DataVolumeActions: FC<DataVolumeActionsProps> = ({ dataVolume, isKebabToggle }) => {
  const [actions] = useDataVolumeActions(dataVolume);

  return (
    <ActionsDropdown actions={actions} id="datavolume-actions" isKebabToggle={isKebabToggle} />
  );
};

export default DataVolumeActions;
