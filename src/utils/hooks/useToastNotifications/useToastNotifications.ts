import { AlertVariant } from '@patternfly/react-core';

import { addErrorToast, addSuccessToast, addToast, removeToast } from './toastNotificationsSignals';

type UseToastNotifications = () => {
  addErrorToast: (title: string, description?: string) => string;
  addSuccessToast: (title: string, description?: string) => string;
  addToast: (title: string, variant?: AlertVariant, description?: string) => string;
  removeToast: (id: string) => void;
};

const useToastNotifications: UseToastNotifications = () => {
  return {
    addErrorToast,
    addSuccessToast,
    addToast,
    removeToast,
  };
};

export default useToastNotifications;
