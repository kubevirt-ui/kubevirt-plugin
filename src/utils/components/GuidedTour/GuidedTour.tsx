import React, { FC } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';

import TourPopover from './components/TourPopover/TourPopover';
import {
  nextStep,
  prevStep,
  runningTourSignal,
  stepIndexSignal,
  stopTour,
  tourSteps,
} from './utils/constants';

const GuidedTour: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useSignals();
  return (
    <Joyride
      callback={(callbackProps: CallBackProps) => {
        const { action, index, size, step, type } = callbackProps;
        const route = step?.data?.route;

        if (!isEmpty(route) && location.pathname !== route) {
          navigate(route);
        }

        if (action === ACTIONS.CLOSE) {
          stopTour();
          return;
        }

        if (type === EVENTS.STEP_AFTER) {
          if (action === ACTIONS.PREV) {
            prevStep();
            return;
          }
          if (action === ACTIONS.NEXT) {
            if (index === size - 1) {
              stopTour();
              return;
            }
            nextStep();
            return;
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
