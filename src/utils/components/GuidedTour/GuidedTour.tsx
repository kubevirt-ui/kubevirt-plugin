import React, { ComponentType, FC, useMemo } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';

import TourPopover from './components/TourPopover/TourPopover';
import useTour from './hooks/useTour';
import { getTourSteps } from './utils/constants';
import { runningTourSignal, stepIndexSignal, tourStepsSeenSignal } from './utils/guidedTourSignals';
import { handleClose, handleNext, handlePrev } from './utils/utils';

const GuidedTour: FC = () => {
  useSignals();

  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { resetTour } = useTour();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings('quickStart');

  const steps = useMemo(() => getTourSteps(t), [t]);

  return (
    <Joyride
      callback={(callbackProps: CallBackProps) => {
        const { action, index, size, step, type } = callbackProps;
        const route = step?.data?.route;

        if (typeof step?.target === 'string') {
          document.querySelector(step.target)?.scrollIntoView({ block: 'nearest' });
        }

        const markStepSeen = (stepIndex: number) => {
          const mergedSeen = Array.from(
            new Set([
              ...(quickStarts?.tourStepsSeen || []),
              ...tourStepsSeenSignal.value,
              stepIndex,
            ]),
          );
          if (mergedSeen.length !== (quickStarts?.tourStepsSeen || []).length) {
            setQuickStarts?.({ ...quickStarts, tourStepsSeen: mergedSeen });
          }
          if (mergedSeen.length !== tourStepsSeenSignal.value.length) {
            tourStepsSeenSignal.value = mergedSeen;
          }
        };

        if (action === ACTIONS.CLOSE) {
          markStepSeen(index);
          handleClose(resetTour);
          return;
        }

        if (!isEmpty(route) && location.pathname !== route && runningTourSignal.value) {
          navigate(route);
        }

        if (type === EVENTS.STEP_AFTER) {
          markStepSeen(index);

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
