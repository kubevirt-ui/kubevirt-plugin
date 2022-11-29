import React, { ReactNode } from 'react';
import classNames from 'classnames';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';

import { injectDisabled } from '../utils/utils';

import UploadErrorMessage from './UploadPVCErrorMessage';

type UploadPVCButtonBarProps = {
  children?: ReactNode;
  className?: string;
  errorMessage?: string;
  infoMessage?: string;
  successMessage?: string;
  inProgress?: boolean;
  uploadProxyURL?: string;
};

const UploadPVCButtonBar: React.FC<UploadPVCButtonBarProps> = ({
  children,
  className,
  errorMessage,
  infoMessage,
  successMessage,
  inProgress,
  uploadProxyURL,
}) => {
  return (
    <div className={classNames(className, 'co-m-btn-bar')}>
      <AlertGroup
        isLiveRegion
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {successMessage && (
          <Alert
            isInline
            className="co-alert"
            variant={AlertVariant.success}
            title={successMessage}
          />
        )}
        {errorMessage && (
          <UploadErrorMessage message={errorMessage} uploadProxyURL={uploadProxyURL} />
        )}
        {injectDisabled(children, inProgress)}
        {inProgress && <Loading />}
        {infoMessage && (
          <Alert isInline className="co-alert" variant={AlertVariant.info} title={infoMessage} />
        )}
      </AlertGroup>
    </div>
  );
};

export default UploadPVCButtonBar;
