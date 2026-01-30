import { AlertVariant } from '@patternfly/react-core';

import {
  addErrorToast,
  addSuccessToast,
  addToast,
  addWarningToast,
  removeToast,
  ToastNotification,
} from './toastNotificationsSignals';

/** Partial type of ToastNotification for toast message (title + optional description) */
export type ToastNotificationMessage = Pick<ToastNotification, 'title'> &
  Partial<Pick<ToastNotification, 'description'>>;

type UseToastNotifications = () => {
  addErrorToast: (title: string, description?: string) => string;
  addSuccessToast: (title: string, description?: string) => string;
  addToast: (title: string, variant?: AlertVariant, description?: string) => string;
  addWarningToast: (title: string, description?: string) => string;
  removeToast: (id: string) => void;
};

const useToastNotifications: UseToastNotifications = () => {
  return {
    addErrorToast,
    addSuccessToast,
    addToast,
    addWarningToast,
    removeToast,
  };
};

export default useToastNotifications;
