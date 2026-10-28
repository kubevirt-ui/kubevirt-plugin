import type { FC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import { type UploadProgressStoreState } from '../types';

import { type UploadEntry } from '../uploads/types/types';
import ToastLayout from './ToastLayout';
import UploadProgressAbortButton from './UploadProgressAbortButton';
import UploadProgressBar from './UploadProgressBar';
import UploadProgressLinks from './UploadProgressLinks';

type UploadProgressUploadingToastProps = {
  navigate: (path: string) => void;
  storeSlice: keyof UploadProgressStoreState;
  upload: UploadEntry;
  uploadKey: string;
};

const UploadProgressUploadingToast: FC<UploadProgressUploadingToastProps> = ({
  navigate,
  storeSlice,
  upload,
  uploadKey,
}) => {
  const { abortTooltip, cancelUpload, contextLinks, fileName, progress } = upload;
  const showAbort = Boolean(cancelUpload);
  const hasActions = !isEmpty(contextLinks) || showAbort;

  return (
    <ToastLayout dataTest="upload-progress-toast">
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
              <UploadProgressAbortButton
                abortTooltip={abortTooltip}
                storeSlice={storeSlice}
                uploadKey={uploadKey}
              />
            </FlexItem>
          )}
        </Flex>
      )}
    </ToastLayout>
  );
};

export default UploadProgressUploadingToast;
