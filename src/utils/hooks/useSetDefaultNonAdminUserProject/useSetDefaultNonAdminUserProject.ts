import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isSystemNamespace } from '@kubevirt-utils/hooks/useSetDefaultNonAdminUserProject/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseSetDefaultNonAdminUserProject = () => void;

const useSetDefaultNonAdminUserProject: UseSetDefaultNonAdminUserProject = () => {
  const isAdmin = useIsAdmin();
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const [projects] = useProjects();

  const nonDefaultUserProjects = projects.reduce((acc, project) => {
    if (!isSystemNamespace(project)) acc.push(project);
    return acc;
  }, []);

  if (isAdmin || projects.includes(activeNamespace)) return;

  setActiveNamespace(nonDefaultUserProjects[0] ?? DEFAULT_NAMESPACE);
};

export default useSetDefaultNonAdminUserProject;
