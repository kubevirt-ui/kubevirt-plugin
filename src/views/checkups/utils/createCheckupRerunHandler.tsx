import React from 'react';
import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import RerunCheckupModal from '../components/RerunCheckupModal';

import { showRerunToast } from './showRerunToast';
import { isJobRunning } from './utils';

type CreateCheckupRerunHandlerParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  getUrl: (name: string, namespace: string, cluster: string) => string;
  isKebab?: boolean;
  jobs: IoK8sApiBatchV1Job[];
  navigate: (path: string) => void;
  rerun: () => Promise<unknown>;
  runningJobWarningMessage: string;
  t: TFunction;
  toast: ToastActions;
};

export const createCheckupRerunHandler = ({
  configMap,
  createModal,
  getUrl,
  isKebab = false,
  jobs,
  navigate,
  rerun,
  runningJobWarningMessage,
  t,
  toast,
}: CreateCheckupRerunHandlerParams): (() => void) => {
  const executeRerun = async () => {
    try {
      await rerun();
      if (isKebab) {
        showRerunToast({ configMap, getUrl, navigate, t, toast });
      }
    } catch (error) {
      kubevirtConsole.error('Failed to rerun checkup:', error);
      toast.addDangerToast({
        content: error instanceof Error ? error.message : t('An unknown error occurred'),
        title: t('Failed to rerun checkup'),
      });
    }
  };

  return () => {
    const runningJobs = jobs.filter(isJobRunning);
    if (runningJobs.length > 0) {
      createModal((props) => (
        <RerunCheckupModal
          {...props}
          onConfirm={() => {
            props.onClose();
            executeRerun();
          }}
          message={runningJobWarningMessage}
          variant="warning"
        />
      ));
    } else {
      executeRerun();
    }
  };
};
