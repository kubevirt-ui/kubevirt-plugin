import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Button,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Progress,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { UPLOAD_STATUS } from '../../utils/consts';
import { UploadingStatusProps } from '../../utils/types';
import { getProgressVariant } from '../../utils/utils';

const UploadingStatus: React.FC<UploadingStatusProps> = ({
  upload,
  onSuccessClick,
  onCancelClick,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <EmptyStateIcon icon={InProgressIcon} />
      <Title headingLevel="h4" size="lg">
        {t('Uploading data to Persistent Volume Claim')}
      </Title>
      <EmptyStateBody>
        <Stack hasGutter>
          {upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
            <StackItem>
              <Alert
                className="kv--create-upload__alert"
                isInline
                variant={AlertVariant.warning}
                title={t('Please don’t close this browser tab')}
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
        <Button id="cdi-upload-primary-pvc" variant="primary" onClick={onSuccessClick}>
          {t('View Persistent Volume Claim details')}
        </Button>
      )}
      {onCancelClick && upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
        <EmptyStateSecondaryActions>
          <Button id="cdi-upload-cancel-btn" onClick={onCancelClick} variant="link">
            {t('Cancel Upload')}
          </Button>
        </EmptyStateSecondaryActions>
      )}
    </>
  );
};

export default UploadingStatus;
