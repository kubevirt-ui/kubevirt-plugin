import { PlanModel } from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const useIsMTVInstalled = () => {
  const [mtvPlan] = useK8sModel(modelToGroupVersionKind(PlanModel));

  return !isEmpty(mtvPlan);
};

export default useIsMTVInstalled;
