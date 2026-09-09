import { useLocation, useNavigate } from 'react-router';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';

import { TOUR_STEPS_COUNT } from '../utils/constants';
import { namespaceSignal, runningTourSignal, stepIndexSignal } from '../utils/guidedTourSignals';

type UseTourReturn = {
  resetTour: () => void;
  startTour: () => void;
  stopTour: () => void;
};

const useTour = (): UseTourReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();

  const startTour = (): void => {
    if (stepIndexSignal.value >= TOUR_STEPS_COUNT) stepIndexSignal.value = 0;
    namespaceSignal.value = namespace;
    runningTourSignal.value = true;
  };

  const stopTour = (): void => {
    runningTourSignal.value = false;
    // Navigate back to the user's namespace URL if the tour moved them to all-namespaces
    if (location.pathname.includes(ALL_NAMESPACES) && namespaceSignal.value) {
      navigate(location.pathname.replace(ALL_NAMESPACES, `ns/${namespaceSignal.value}`), {
        replace: true,
      });
    }
  };

  const resetTour = (): void => {
    stopTour();
    stepIndexSignal.value = 0;
  };

  return { resetTour, startTour, stopTour };
};

export default useTour;
