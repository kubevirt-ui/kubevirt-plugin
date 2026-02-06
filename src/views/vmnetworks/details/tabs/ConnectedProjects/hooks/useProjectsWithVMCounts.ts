import useVMNetworkMatchedProjects from 'src/views/vmnetworks/hooks/useVMNetworkMatchedProjects';

import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useConnectedVMsWithNamespace from '../../../hooks/useConnectedVMsWithNamespace';
import { ProjectWithVMCount } from '../../../types';

type UseProjectsWithVMCounts = (
  obj: ClusterUserDefinedNetworkKind,
) => [projectsWithVMCounts: ProjectWithVMCount[], loaded: boolean, error: Error];

const useProjectsWithVMCounts: UseProjectsWithVMCounts = (obj) => {
  const [matchingProjects, projectsLoaded] = useVMNetworkMatchedProjects(obj);
  const [vmsWithNetworkNamespace, vmsLoaded, vmsError] = useConnectedVMsWithNamespace(getName(obj));

  const result = matchingProjects.map((project) => {
    const projectName = getName(project);
    return {
      projectName,
      vmCount: vmsWithNetworkNamespace.filter(({ namespace }) => namespace === projectName).length,
    };
  });

  return [result, projectsLoaded && vmsLoaded, vmsError];
};

export default useProjectsWithVMCounts;
