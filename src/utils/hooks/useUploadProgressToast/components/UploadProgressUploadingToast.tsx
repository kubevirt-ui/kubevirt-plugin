import React, { FC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import { UploadEntry } from '../utils/types';

import UploadProgressAbortButton from './UploadProgressAbortButton';
import UploadProgressBar from './UploadProgressBar';
import UploadProgressLinks from './UploadProgressLinks';

type UploadProgressUploadingToastProps = {
  navigate: (path: string) => void;
  upload: UploadEntry;
  uploadKey: string;
};

const UploadProgressUploadingToast: FC<UploadProgressUploadingToastProps> = ({
  navigate,
  upload,
  uploadKey,
}) => {
  const { abortTooltip, cancelUpload, contextLinks, fileName, progress } = upload;
  const showAbort = Boolean(cancelUpload);
  const hasActions = !isEmpty(contextLinks) || showAbort;

  return (
    <Flex direction={{ default: 'column' }}>
      <UploadProgressBar fileName={fileName} progress={progress} showSpinner />
      {hasActions && (
        <Flex alignItems={{ default: 'alignItemsCenter' }} className="pf-v6-u-w-100">
          {!isEmpty(contextLinks) && (
            <FlexItem grow={{ default: 'grow' }}>
              <UploadProgressLinks links={contextLinks} navigate={navigate} />
            </FlexItem>
          )}
          {showAbort && (
            <FlexItem className={isEmpty(contextLinks) ? 'pf-v6-u-ml-auto' : undefined}>
              <UploadProgressAbortButton abortTooltip={abortTooltip} uploadKey={uploadKey} />
            </FlexItem>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default UploadProgressUploadingToast;
