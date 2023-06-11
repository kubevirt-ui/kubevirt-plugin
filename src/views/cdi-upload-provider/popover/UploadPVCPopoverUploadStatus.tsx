import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Popover,
  PopoverPosition,
  Progress,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { BanIcon, ErrorCircleOIcon, InProgressIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';

import { UPLOAD_STATUS } from '../utils/consts';
import { DataUpload } from '../utils/types';
import { getProgressVariant } from '../utils/utils';

type UploadPVCPopoverUploadStatusProps = {
  error: { message: string };
  onCancelClick: () => void;
  onErrorDeleteSource: () => void;
  upload: DataUpload;
};

const UploadPVCPopoverUploadStatus: React.FC<UploadPVCPopoverUploadStatusProps> = ({
  error,
  onCancelClick,
  onErrorDeleteSource,
  upload,
}) => {
  const { t } = useKubevirtTranslation();

  const getPopoverBody = (status: string) => {
    switch (status) {
      case UPLOAD_STATUS.ERROR:
        return {
          body: error?.message,
          icon: <ErrorCircleOIcon className="co-icon-and-text__icon" color={dangerColor?.value} />,
          title: t('Upload error'),
        };
      case UPLOAD_STATUS.CANCELED:
        return {
          body: error ? error?.message : t('Removing Resources'),
          icon: (
            <BanIcon className="co-icon-and-text__icon" color={error ? dangerColor?.value : ''} />
          ),
          title: error ? t('Cancel error') : t('Upload canceled'),
        };
      case UPLOAD_STATUS.UPLOADING:
        return {
          body: t('Please do not close this window, you can keep navigating the app freely.'),
          icon: <InProgressIcon className="co-icon-and-text__icon" />,
          title: t('Uploading'),
        };
      case UPLOAD_STATUS.SUCCESS:
        return {
          icon: <InProgressIcon className="co-icon-and-text__icon" />,
          title: t('Upload finished'),
        };
      default:
        return null;
    }
  };

  const uploadPopoverBody = getPopoverBody(upload?.uploadStatus);
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            {upload?.uploadStatus === UPLOAD_STATUS.CANCELED && (
              <Spinner className="co-icon-and-text__icon" size="md" />
            )}
            {uploadPopoverBody?.body}
          </StackItem>
          <StackItem>
            <Progress
              title={upload?.fileName}
              value={upload?.progress}
              variant={getProgressVariant(upload?.uploadStatus)}
            />
          </StackItem>
          {upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
            <StackItem>
              <Button
                className="pf-m-link--align-left"
                id="cdi-upload-cancel-btn"
                onMouseUp={onCancelClick}
                variant="link"
              >
                {t('Cancel upload')}
              </Button>
            </StackItem>
          )}
          {upload?.uploadStatus === UPLOAD_STATUS.ERROR && (
            <StackItem>
              <Button
                className="pf-m-link--align-left"
                id="cdi-upload-delete-btn"
                isDanger
                onMouseUp={onErrorDeleteSource}
                variant="link"
              >
                {t('Delete source')}
              </Button>
            </StackItem>
          )}
        </Stack>
      }
      headerContent={<div>{uploadPopoverBody?.title}</div>}
      position={PopoverPosition.bottom}
    >
      <Button
        className="pf-m-link--align-left"
        id="cdi-upload-popover-btn"
        variant={ButtonVariant.link}
      >
        {uploadPopoverBody?.icon}
        {uploadPopoverBody?.title}
      </Button>
    </Popover>
  );
};

export default UploadPVCPopoverUploadStatus;
