import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { dateTimeFormatter } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { getGroupVersionKindForResource } from '@openshift-console/dynamic-plugin-sdk';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';
import { AlertVariant, Button, Flex, FlexItem } from '@patternfly/react-core';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';
import { TOAST_TIMEOUT_DEFAULT, TOAST_TIMEOUT_LONG, USERSETTINGS_PREFIX } from '../../const';
import { ToastContextType } from '../../utils/contexts/ToastContext/utils/types';
import {
  createExportResource,
  getExportAppData,
  getExportResource,
  killExportResource,
} from '../../utils/export-app-utils';

import ExportViewLogButton from './ExportViewLogButton';
import { ExportAppUserSettings } from './types';

export type ExportApplicationModalProps = ModalComponentProps & {
  name: string;
  namespace: string;
  toast?: ToastContextType;
  exportResource?: K8sResourceKind;
};

export const ExportApplicationModal: FC<ExportApplicationModalProps> = (props) => {
  const { t } = useTranslation();
  const fireTelemetryEvent = useTelemetry();
  const { cancel, name, namespace, exportResource, toast } = props;
  const [startTime, setStartTime] = useState<string>(null);
  const [errMessage, setErrMessage] = useState<string>('');
  const [exportAppToast, setExportAppToast] = useUserSettings<ExportAppUserSettings>(
    `${USERSETTINGS_PREFIX}.exportApp`,
    {},
    true,
  );

  useEffect(() => {
    if (exportResource && exportResource.status?.completed !== true) {
      setStartTime(dateTimeFormatter.format(new Date(exportResource.metadata.creationTimestamp)));
    }
  }, [exportResource]);

  const createExportCR = async () => {
    try {
      const exportRes = await createExportResource(getExportAppData(name, namespace));
      fireTelemetryEvent('Export Application Started');
      const key = `${namespace}-${name}`;
      const exportAppToastConfig = {
        ...exportAppToast,
        [key]: {
          groupVersionKind: getGroupVersionKindForResource(exportRes),
          uid: exportRes.metadata.uid,
          name,
          namespace,
        },
      };
      toast?.addToast({
        variant: AlertVariant.info,
        title: t('kubevirt-plugin~Export application'),
        content: (
          <>
            <Trans t={t} ns="topology">
              Export of resources in <strong>{{ namespace }}</strong> has started.
            </Trans>
            <ExportViewLogButton name={name} namespace={namespace} />
          </>
        ),
        dismissible: true,
        timeout: TOAST_TIMEOUT_LONG,
      });
      setExportAppToast(exportAppToastConfig);
    } catch (error) {
      toast?.addToast({
        variant: AlertVariant.danger,
        title: t('kubevirt-plugin~Export application'),
        content: (
          <Trans t={t} ns="topology">
            Export of resources in <strong>{{ namespace }}</strong> has failed with error:{' '}
            {error.message}
          </Trans>
        ),
        dismissible: true,
        timeout: TOAST_TIMEOUT_DEFAULT,
      });
    }
  };

  const killExportCR = async (): Promise<boolean> => {
    if (exportResource) {
      await killExportResource(exportResource);
    }
    return true;
  };

  const restartExportCR = async (): Promise<boolean> => {
    try {
      if (exportResource) {
        await killExportResource(exportResource);
      }
      const exportRes = await getExportResource(name, namespace);
      if (exportRes) {
        setTimeout(createExportCR, 2000);
      } else {
        await createExportCR();
      }
    } catch (err) {
      createExportCR().catch((createError) =>
        // eslint-disable-next-line no-console
        console.warn('Could not createExportCR:', createError),
      );
    }
    return true;
  };

  const handleStartExport = async () => {
    try {
      if (exportResource && exportResource.status?.completed) {
        await killExportResource(exportResource);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [`${namespace}-${name}`]: unusedProp, ...otherProps } = exportAppToast;
        const exportAppToastConfig = otherProps;
        setExportAppToast(exportAppToastConfig);
        await createExportCR();
      } else {
        await createExportCR();
      }
    } catch (error) {
      createExportCR().catch((createError) =>
        // eslint-disable-next-line no-console
        console.warn('Could not createExportCR:', createError),
      );
    }
    cancel();
  };

  const handleCancel = async () => {
    try {
      await killExportCR();
      cancel();
    } catch (err) {
      setErrMessage(err.message);
    }
  };

  const handleRestart = async () => {
    try {
      await restartExportCR();
      cancel();
    } catch (err) {
      setErrMessage(err.message);
    }
  };
  const exportInProgress = exportResource && exportResource.status?.completed !== true;

  return (
    <div className="modal-content" data-test="export-application-modal">
      <ModalTitle>{t('kubevirt-plugin~Export Application')}</ModalTitle>
      <ModalBody>
        {exportInProgress ? (
          startTime ? (
            <Trans t={t} ns="topology">
              Application export in <strong>{{ namespace }}</strong> is in progress. Started at{' '}
              {{ startTime }}.
            </Trans>
          ) : (
            <Trans t={t} ns="topology">
              Application export in <strong>{{ namespace }}</strong> is in progress.
            </Trans>
          )
        ) : (
          <Trans t={t} ns="topology">
            Do you want to export your application?
          </Trans>
        )}
      </ModalBody>
      <ModalFooter inProgress={false} errorMessage={errMessage}>
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <FlexItem>
            <Button
              type="button"
              variant="secondary"
              data-test={exportInProgress ? 'export-cancel-btn' : 'cancel-btn'}
              onClick={() => (exportInProgress ? handleCancel() : cancel())}
            >
              {exportInProgress ? t('kubevirt-plugin~Cancel Export') : t('kubevirt-plugin~Cancel')}
            </Button>
          </FlexItem>
          {exportInProgress && (
            <>
              <FlexItem>
                <Button
                  type="button"
                  variant="secondary"
                  data-test="export-restart-btn"
                  onClick={handleRestart}
                >
                  {t('kubevirt-plugin~Restart Export')}
                </Button>
              </FlexItem>
              <FlexItem>
                <ExportViewLogButton name={name} namespace={namespace} onViewLog={cancel} />
              </FlexItem>
            </>
          )}
          <FlexItem>
            <Button
              type="button"
              variant="primary"
              data-test={
                exportResource && exportResource.status?.completed !== true
                  ? 'export-close-btn'
                  : 'close-btn'
              }
              onClick={() =>
                exportResource && exportResource.status?.completed !== true
                  ? cancel()
                  : handleStartExport()
              }
            >
              {t('kubevirt-plugin~OK')}
            </Button>
          </FlexItem>
        </Flex>
      </ModalFooter>
    </div>
  );
};

export const exportApplicationModal =
  createModalLauncher<ExportApplicationModalProps>(ExportApplicationModal);

export const handleExportApplication = async (
  name: string,
  namespace: string,
  toast: ToastContextType,
) => {
  try {
    const exportRes = await getExportResource(name, namespace);
    exportApplicationModal({
      name,
      namespace,
      exportResource: exportRes,
      toast,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(err, 'Resource not found');
    exportApplicationModal({
      name,
      namespace,
      toast,
    });
  }
};
