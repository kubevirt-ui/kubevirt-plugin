import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const useIsMTCInstalled = () => {
  const [migPlan] = useK8sModel(modelToGroupVersionKind(MigPlanModel));

  return !isEmpty(migPlan);
};

export default useIsMTCInstalled;
