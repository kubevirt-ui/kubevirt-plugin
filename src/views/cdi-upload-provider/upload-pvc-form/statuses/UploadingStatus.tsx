import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Progress,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { UPLOAD_STATUS } from '../../utils/consts';
import { UploadingStatusProps } from '../../utils/types';
import { getProgressVariant } from '../../utils/utils';

const UploadingStatus: FC<UploadingStatusProps> = ({ onCancelClick, onSuccessClick, upload }) => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState
      headingLevel="h4"
      icon={InProgressIcon}
      titleText={t('Uploading data to Persistent Volume Claim')}
    >
      <EmptyStateBody>
        <Stack hasGutter>
          {upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
            <StackItem>
              <Alert
                className="kv--create-upload__alert"
                isInline
                title={t('Please don’t close this browser tab')}
                variant={AlertVariant.warning}
              >
                {t('Closing it will cause the upload to fail. You may still navigate the console.')}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            {t(
              'Persistent Volume Claim has been created and your data source is now being uploaded to it. Once the uploading is completed the Persistent Volume Claim will become available',
            )}
          </StackItem>
          <StackItem>
            <Progress value={upload?.progress} variant={getProgressVariant(upload?.uploadStatus)} />
          </StackItem>
        </Stack>
      </EmptyStateBody>
      {onSuccessClick && (
        <Button id="cdi-upload-primary-pvc" onClick={onSuccessClick} variant="primary">
          {t('View Persistent Volume Claim details')}
        </Button>
      )}
      {onCancelClick && upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
        <EmptyStateActions>
          <Button id="cdi-upload-cancel-btn" onClick={onCancelClick} variant="link">
            {t('Cancel Upload')}
          </Button>
        </EmptyStateActions>
      )}
    </EmptyState>
  );
};

export default UploadingStatus;
