import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import useProjects from '@kubevirt-utils/hooks/useProjects';

const BootableVolumeListNamespaceSelect: FC = () => {
  const { setVolumeListNamespace, volumeListNamespace } = useInstanceTypeVMStore();
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
      selected={volumeListNamespace}
      setSelected={setVolumeListNamespace}
    />
  );
};

export default BootableVolumeListNamespaceSelect;
