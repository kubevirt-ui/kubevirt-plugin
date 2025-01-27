import { useEffect } from 'react';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { isSystemNamespace } from '@virtualmachines/tree/utils/utils';

const useSelectNamespace = () => {
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const [projects, projectsLoaded] = useProjects();

  useEffect(() => {
    if (activeNamespace !== ALL_NAMESPACES_SESSION_KEY) return;
    if (!projectsLoaded) return;

    const userNamespace = projects?.filter((project) => !isSystemNamespace(project));
    const defaultNamespace = projects?.find((project) => project === DEFAULT_NAMESPACE);

    const namespaceToSelect = defaultNamespace || userNamespace?.[0] || projects?.[0];

    setActiveNamespace(namespaceToSelect);
  }, [activeNamespace, projects, projectsLoaded, setActiveNamespace]);
};

export default useSelectNamespace;
