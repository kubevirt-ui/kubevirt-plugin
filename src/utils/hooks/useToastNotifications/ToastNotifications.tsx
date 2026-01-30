import React from 'react';

import { Alert, AlertGroup } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { TOAST_TIMEOUT_MS } from './constants';
import { removeToast, toastNotificationsSignal } from './toastNotificationsSignals';

const ToastNotifications: React.FC = () => {
  useSignals();
  const notifications = toastNotificationsSignal.value;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', right: '20px', top: '80px', zIndex: 10000 }}>
      <AlertGroup
        aria-atomic="false"
        aria-live="polite"
        aria-relevant="additions text"
        isLiveRegion
        isToast
      >
        {notifications.map(({ description, id, title, variant }) => {
          return (
            <Alert
              isLiveRegion
              key={id}
              onTimeout={() => removeToast(id)}
              timeout={TOAST_TIMEOUT_MS}
              title={title}
              variant={variant}
            >
              {description}
            </Alert>
          );
        })}
      </AlertGroup>
    </div>
  );
};

export default ToastNotifications;
