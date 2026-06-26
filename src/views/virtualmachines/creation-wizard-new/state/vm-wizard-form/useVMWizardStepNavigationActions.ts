import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';

import { CREATE_VM_FORM_FIELDS_STEP_NAVIGATION } from './consts';

const useVMWizardStepNavigationActions = () => {
  const { getValues, setValue } = useVMWizard();

  const markStepVisited = (stepId: string) => {
    const visitedSteps: Set<string> = getValues(
      CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.VISITED_STEPS,
    );
    if (visitedSteps.has(stepId)) {
      return;
    }

    const nextVisitedSteps = new Set(visitedSteps);
    nextVisitedSteps.add(stepId);
    setValue(CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.VISITED_STEPS, nextVisitedSteps);
  };

  return { markStepVisited };
};

export default useVMWizardStepNavigationActions;
