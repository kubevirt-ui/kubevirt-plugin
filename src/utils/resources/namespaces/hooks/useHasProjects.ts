import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const useHasProjects = () => {
  const [model] = useK8sModel(modelToGroupVersionKind(ProjectModel));

  return useMemo(() => !isEmpty(model), [model]);
};

export default useHasProjects;
