import { PlanModel } from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const useIsMTVInstalled = (): [boolean, boolean] => {
  const [mtvPlan, inFlight] = useK8sModel(modelToGroupVersionKind(PlanModel));

  return [!isEmpty(mtvPlan), inFlight];
};

export default useIsMTVInstalled;
