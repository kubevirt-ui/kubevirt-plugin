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
  onErrorDeleteSource: () => void;
  upload: DataUpload;
  onCancelClick: () => void;
};

const UploadPVCPopoverUploadStatus: React.FC<UploadPVCPopoverUploadStatusProps> = ({
  error,
  onErrorDeleteSource,
  upload,
  onCancelClick,
}) => {
  const { t } = useKubevirtTranslation();

  const getPopoverBody = (status: string) => {
    switch (status) {
      case UPLOAD_STATUS.ERROR:
        return {
          title: t('Upload error'),
          body: error?.message,
          icon: <ErrorCircleOIcon className="co-icon-and-text__icon" color={dangerColor?.value} />,
        };
      case UPLOAD_STATUS.CANCELED:
        return {
          title: error ? t('Cancel error') : t('Upload canceled'),
          body: error ? error?.message : t('Removing Resources'),
          icon: (
            <BanIcon className="co-icon-and-text__icon" color={error ? dangerColor?.value : ''} />
          ),
        };
      case UPLOAD_STATUS.UPLOADING:
        return {
          title: t('Uploading'),
          body: t('Please do not close this window, you can keep navigating the app freely.'),
          icon: <InProgressIcon className="co-icon-and-text__icon" />,
        };
      case UPLOAD_STATUS.SUCCESS:
        return {
          title: t('Upload finished'),
          icon: <InProgressIcon className="co-icon-and-text__icon" />,
        };
      default:
        return null;
    }
  };

  const uploadPopoverBody = getPopoverBody(upload?.uploadStatus);
  return (
    <Popover
      headerContent={<div>{uploadPopoverBody?.title}</div>}
      position={PopoverPosition.bottom}
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            {upload?.uploadStatus === UPLOAD_STATUS.CANCELED && (
              <Spinner size="md" className="co-icon-and-text__icon" />
            )}
            {uploadPopoverBody?.body}
          </StackItem>
          <StackItem>
            <Progress
              value={upload?.progress}
              title={upload?.fileName}
              variant={getProgressVariant(upload?.uploadStatus)}
            />
          </StackItem>
          {upload?.uploadStatus === UPLOAD_STATUS.UPLOADING && (
            <StackItem>
              <Button
                id="cdi-upload-cancel-btn"
                className="pf-m-link--align-left"
                variant="link"
                onMouseUp={onCancelClick}
              >
                {t('Cancel upload')}
              </Button>
            </StackItem>
          )}
          {upload?.uploadStatus === UPLOAD_STATUS.ERROR && (
            <StackItem>
              <Button
                id="cdi-upload-delete-btn"
                className="pf-m-link--align-left"
                variant="link"
                onMouseUp={onErrorDeleteSource}
                isDanger
              >
                {t('Delete source')}
              </Button>
            </StackItem>
          )}
        </Stack>
      }
    >
      <Button
        id="cdi-upload-popover-btn"
        className="pf-m-link--align-left"
        variant={ButtonVariant.link}
      >
        {uploadPopoverBody?.icon}
        {uploadPopoverBody?.title}
      </Button>
    </Popover>
  );
};

export default UploadPVCPopoverUploadStatus;
