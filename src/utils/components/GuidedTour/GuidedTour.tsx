import React, { FC } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { isEmpty } from '@kubevirt-utils/utils/utils';

import TourPopover from './components/TourPopover/TourPopover';
import useTour from './hooks/useTour';
import { tourSteps } from './utils/constants';
import { nextStep, prevStep, runningTourSignal, stepIndexSignal } from './utils/guidedTourSignals';

const GuidedTour: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { stopTour } = useTour();

  return (
    <Joyride
      callback={(callbackProps: CallBackProps) => {
        const { action, size, step, type } = callbackProps;
        const route = step?.data?.route;

        if (typeof step?.target === 'string') {
          document.querySelector(step.target)?.scrollIntoView();
        }

        if (!isEmpty(route) && location.pathname !== route && runningTourSignal.value) {
          navigate(route);
        }

        if (action === ACTIONS.CLOSE) {
          if (stepIndexSignal.value === size - 1) {
            nextStep();
          }
          stopTour();

          return;
        }

        if (type === EVENTS.STEP_AFTER) {
          if (action === ACTIONS.PREV) {
            prevStep();

            return;
          }
          if (action === ACTIONS.NEXT) {
            if (stepIndexSignal.value < size - 1) {
              nextStep();
              return;
            }

            if (stepIndexSignal.value === size - 1) {
              nextStep();
              stopTour();
              return;
            }
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
      steps={tourSteps}
      tooltipComponent={TourPopover as any}
    />
  );
};

export default GuidedTour;
