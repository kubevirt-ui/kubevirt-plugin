import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';

import { tourSteps } from '../utils/constants';
import { namespaceSignal, runningTourSignal, stepIndexSignal } from '../utils/guidedTourSignals';

const useTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();

  const resetNamespace = () => {
    if (location.pathname.includes(ALL_NAMESPACES) && namespaceSignal.value) {
      const newPath = location.pathname.replace(ALL_NAMESPACES, `ns/${namespaceSignal.value}`);
      navigate(newPath, { replace: true });
    }
  };

  const startTour = () => {
    if (stepIndexSignal.value >= tourSteps.length) stepIndexSignal.value = 0;
    runningTourSignal.value = true;
    namespaceSignal.value = namespace;
  };

  const stopTour = () => {
    runningTourSignal.value = false;
    resetNamespace();
  };

  return { startTour, stopTour };
};

export default useTour;
