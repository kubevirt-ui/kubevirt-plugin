import React, { FC, useState } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, FlexItem } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import { CheckupsStatus, getJobStatus } from '../../../utils/utils';
import DownloadResultsErrorModal from '../../components/DownloadResultsErrorModal';
import { downloadResults } from '../../utils';

type DownloadResultsButtonProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const DownloadResultsButton: FC<DownloadResultsButtonProps> = ({ configMap, job }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isWaitingForUrl, setIsWaitingForUrl] = useState(false);

  if (!configMap || !job) {
    return null;
  }

  const jobStatus = getJobStatus(job);
  const isCompleted = jobStatus === CheckupsStatus.Done;

  const handleError = (error: string, url?: string) => {
    if (error) {
      createModal((props) => (
        <DownloadResultsErrorModal {...props} errorMessage={error} url={url} />
      ));
    }
  };

  const handleDownloadResults = async () => {
    if (!job) {
      kubevirtConsole.log('No job found for ConfigMap:', configMap.metadata.name);
      handleError(t('No job found for this checkup.'));
      return;
    }

    if (!isCompleted) {
      kubevirtConsole.log('Checkup not completed yet. Status:', jobStatus);
      handleError(
        t(
          'The checkup is not completed yet. Please wait for it to finish before downloading results.',
        ),
      );
      return;
    }

    const namespace = configMap.metadata.namespace;
    if (!namespace) {
      kubevirtConsole.error('No namespace found for ConfigMap:', configMap.metadata.name);
      handleError(t('Could not determine namespace for this checkup.'));
      return;
    }

    await downloadResults({
      job,
      namespace,
      onError: (errorMessage, url) => {
        handleError(errorMessage, url);
      },
      onProgress: (isWaiting) => {
        setIsWaitingForUrl(isWaiting);
      },
      t,
    });
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <FlexItem>
      <Button
        icon={<DownloadIcon />}
        isDisabled={isWaitingForUrl}
        isLoading={isWaitingForUrl}
        onClick={handleDownloadResults}
        variant={ButtonVariant.link}
      >
        {t('Download results')}
      </Button>
    </FlexItem>
  );
};

export default DownloadResultsButton;
