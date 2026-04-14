import { TOUR_GUIDE_VM_TREE_ID } from './constants';
import { nextStep, prevStep, tourContextMenuTriggerSignal } from './guidedTourSignals';

export const CONTEXT_MENU_STEP_INDEX = 1;

export const openContextMenu = () => {
  tourContextMenuTriggerSignal.value = document.getElementById(TOUR_GUIDE_VM_TREE_ID);
};

export const closeContextMenu = () => {
  tourContextMenuTriggerSignal.value = null;
};

export const handleClose = (resetTour: () => void) => {
  closeContextMenu();
  resetTour();
};

export const handlePrev = (currentIndex: number) => {
  if (currentIndex === CONTEXT_MENU_STEP_INDEX) {
    closeContextMenu();
    prevStep();
    return;
  }
  if (currentIndex === CONTEXT_MENU_STEP_INDEX + 1) {
    openContextMenu();
    prevStep();
    return;
  }
  prevStep();
};

export const handleNext = (currentIndex: number, size: number, resetTour: () => void) => {
  if (currentIndex === CONTEXT_MENU_STEP_INDEX - 1) {
    openContextMenu();
    nextStep();
    return;
  }
  if (currentIndex === CONTEXT_MENU_STEP_INDEX) {
    closeContextMenu();
  }
  if (currentIndex < size - 1) {
    nextStep();
    return;
  }
  if (currentIndex === size - 1) {
    resetTour();
  }
};
