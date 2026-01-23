import React from 'react';

import { Alert, AlertGroup } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

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
        {notifications.map((notification) => (
          <Alert
            isLiveRegion
            key={notification.id}
            onTimeout={() => removeToast(notification.id)}
            timeout={8000}
            title={notification.title}
            variant={notification.variant}
          >
            {notification.description}
          </Alert>
        ))}
      </AlertGroup>
    </div>
  );
};

export default ToastNotifications;
