import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import useProjects from '@kubevirt-utils/hooks/useProjects';

type NamespaceDropdownProps = {
  namespace: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({ namespace, setBootableVolumeField }) => {
  const [projectNames] = useProjects();

  return (
    <InlineFilterSelect
      options={projectNames?.map((name) => ({
        children: name,
        groupVersionKind: modelToGroupVersionKind(ProjectModel),
        value: name,
      }))}
      toggleProps={{
        isFullWidth: true,
      }}
      popperProps={{ enableFlip: true }}
      selected={namespace}
      setSelected={setBootableVolumeField('pvcNamespace')}
    />
  );
};

export default NamespaceDropdown;
