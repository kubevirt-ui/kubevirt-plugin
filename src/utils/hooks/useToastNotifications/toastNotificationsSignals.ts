import { AlertVariant } from '@patternfly/react-core';
import { signal } from '@preact/signals-react';

export type ToastNotification = {
  description?: string;
  id: string;
  title: string;
  variant: AlertVariant;
};

export const toastNotificationsSignal = signal<ToastNotification[]>([]);

export const addToast = (
  title: string,
  variant: AlertVariant = AlertVariant.warning,
  description?: string,
): string => {
  const id = `toast-${Date.now()}-${Math.random()}`;
  const notification: ToastNotification = {
    description,
    id,
    title,
    variant,
  };

  toastNotificationsSignal.value = [...toastNotificationsSignal.value, notification];

  // Auto-remove after 8 seconds (PatternFly recommendation)
  setTimeout(() => {
    removeToast(id);
  }, 8000);

  return id;
};

export const removeToast = (id: string): void => {
  toastNotificationsSignal.value = toastNotificationsSignal.value.filter(
    (notification) => notification.id !== id,
  );
};

export const addErrorToast = (title: string, description?: string): string => {
  return addToast(title, AlertVariant.danger, description);
};

export const addWarningToast = (title: string, description?: string): string => {
  return addToast(title, AlertVariant.warning, description);
};

export const addSuccessToast = (title: string, description?: string): string => {
  return addToast(title, AlertVariant.success, description);
};
