import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { K8sResourceKind } from 'src/views/clusteroverview/utils/types';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  useK8sWatchResources,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';
import { AlertVariant } from '@patternfly/react-core';

import { USERSETTINGS_PREFIX } from '../../const';
import { ExportModel } from '../../models';
import useToast from '../../utils/hooks/useToast';

import { ExportAppUserSettings } from './types';

export const ExportAppContext = createContext({});

export const ExportAppContextProvider = ExportAppContext.Provider;

const useExportAppFormToast = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [currentToasts, setCurrentToasts] = useState<{ [key: string]: { toastId: string } }>({});
  const [exportAppToast, setExportAppToast, exportAppToastLoaded] =
    useUserSettings<ExportAppUserSettings>(`${USERSETTINGS_PREFIX}.exportApp`, {}, true);

  const exportAppWatchResources = useMemo<Record<string, WatchK8sResource>>(() => {
    if (!exportAppToastLoaded || isEmpty(exportAppToast)) return {};
    const keys = Object.keys(exportAppToast);
    const watchRes = keys.reduce((acc, k) => {
      const { groupVersionKind, name, namespace: resNamespace } = exportAppToast[k];
      acc[k] = {
        groupVersionKind: groupVersionKind || getGroupVersionKindForModel(ExportModel),
        name,
        namespace: resNamespace,
        namespaced: true,
        isList: false,
        optional: true,
      };
      return acc;
    }, {} as Record<string, WatchK8sResource>);
    return watchRes;
  }, [exportAppToast, exportAppToastLoaded]);

  const exportResources = useK8sWatchResources<{ [k: string]: K8sResourceKind }>(
    exportAppWatchResources,
  );

  const cleanToast = useCallback(
    (k: string) => {
      const toastDismiss = currentToasts[k];
      if (toastDismiss) {
        toast.removeToast(toastDismiss.toastId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [k]: unusedProperty, ...otherProps } = currentToasts;
        setCurrentToasts(otherProps);
      }
    },
    [currentToasts, toast],
  );

  const cleanToastConfig = useCallback(
    (k: string) => {
      if (exportAppToastLoaded) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [k]: unusedProperty, ...otherProps } = exportAppToast;
        setExportAppToast(otherProps);
      }
    },
    [exportAppToast, exportAppToastLoaded, setExportAppToast],
  );

  useEffect(() => {
    if (exportResources) {
      const keys = Object.keys(exportResources);
      keys.forEach((k) => {
        if (exportResources[k].loadError?.response?.status === 404) {
          cleanToast(k);
          cleanToastConfig(k);
        }
      });
    }
  }, [cleanToast, cleanToastConfig, exportResources]);

  const showDownloadToast = useCallback(
    (expNamespace: string, routeUrl: string, key: string) => {
      const toastId = toast.addToast({
        variant: AlertVariant.info,
        title: t('kubevirt-plugin~Export application'),
        content: t(
          'kubevirt-plugin~All the resources are exported successfully from {{namespace}}. Click below to download it.',
          {
            namespace: expNamespace,
          },
        ),
        dismissible: true,
        actions: [
          {
            dismiss: true,
            label: t('kubevirt-plugin~Download'),
            callback: () => {
              cleanToast(key);
              cleanToastConfig(key);
              window.open(routeUrl, '_blank');
            },
            component: 'a',
            dataTest: 'download-export',
          },
        ],
        onClose: () => cleanToastConfig(key),
      });
      setCurrentToasts((toasts) => ({ ...toasts, [key]: { toastId } }));
    },
    [cleanToast, cleanToastConfig, t, toast],
  );

  useEffect(() => {
    if (exportAppToastLoaded) {
      const keys = Object.keys(exportAppToast);
      keys.forEach((k) => {
        const isValidResource =
          exportResources[k].loaded &&
          !exportResources[k].loadError &&
          exportResources[k].data &&
          exportAppToast[k].uid === exportResources[k].data.metadata.uid;
        if (
          isValidResource &&
          exportResources[k].data.status?.completed &&
          exportResources[k].data.status?.route &&
          !currentToasts[k]
        ) {
          showDownloadToast(
            exportResources[k].data.metadata.namespace,
            exportResources[k].data.status.route,
            k,
          );
        } else if (
          isValidResource &&
          !exportResources[k].data.status?.completed &&
          currentToasts[k]
        ) {
          cleanToast(k);
        }
      });
    }
  }, [
    exportResources,
    exportAppToast,
    exportAppToastLoaded,
    showDownloadToast,
    currentToasts,
    cleanToast,
  ]);
};

export default useExportAppFormToast;
