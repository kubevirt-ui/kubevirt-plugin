import React, { ComponentType, FC, useMemo } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';

import TourPopover from './components/TourPopover/TourPopover';
import useTour from './hooks/useTour';
import { getTourSteps } from './utils/constants';
import { runningTourSignal, stepIndexSignal } from './utils/guidedTourSignals';
import { handleClose, handleNext, handlePrev } from './utils/utils';

const GuidedTour: FC = () => {
  useSignals();

  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { resetTour } = useTour();

  const steps = useMemo(() => getTourSteps(t), [t]);

  return (
    <Joyride
      callback={(callbackProps: CallBackProps) => {
        const { action, index, size, step, type } = callbackProps;
        const route = step?.data?.route;

        if (typeof step?.target === 'string') {
          document.querySelector(step.target)?.scrollIntoView({ block: 'nearest' });
        }

        if (!isEmpty(route) && location.pathname !== route && runningTourSignal.value) {
          navigate(route);
        }

        if (action === ACTIONS.CLOSE) {
          handleClose(resetTour);
          return;
        }

        if (type === EVENTS.STEP_AFTER) {
          if (index !== stepIndexSignal.value) return;

          const currentIndex = stepIndexSignal.value;

          if (action === ACTIONS.PREV) {
            handlePrev(currentIndex);
            return;
          }

          if (action === ACTIONS.NEXT) {
            handleNext(currentIndex, size, resetTour);
          }
        }
      }}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
      continuous
      disableScrollParentFix
      floaterProps={{ disableAnimation: true }}
      run={runningTourSignal.value}
      stepIndex={stepIndexSignal.value}
      steps={steps}
      tooltipComponent={TourPopover as ComponentType<TooltipRenderProps>}
    />
  );
};

export default GuidedTour;
