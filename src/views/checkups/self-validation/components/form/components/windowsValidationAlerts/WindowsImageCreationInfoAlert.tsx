import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, StackItem } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import {
  getPipelinesPrerequisiteDescription,
  getPipelinesPrerequisiteTitle,
  getWindowsImageCreationDescription,
  getWindowsImageCreationTitle,
} from './utils';

import './windows-image-creation-info-alert.scss';

type WindowsImageCreationInfoAlertProps = {
  pipelinesMissing: boolean;
};

const WindowsImageCreationInfoAlert: FC<WindowsImageCreationInfoAlertProps> = ({
  pipelinesMissing,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <StackItem className="pf-v6-u-pl-lg">
      {pipelinesMissing ? (
        <Alert isInline title={getWindowsImageCreationTitle(t)} variant={AlertVariant.info}>
          {getWindowsImageCreationDescription(t)}
        </Alert>
      ) : (
        <Alert
          className="windows-image-creation-info-alert"
          isInline
          isLiveRegion
          title={getPipelinesPrerequisiteTitle(t)}
          variant={AlertVariant.info}
        >
          {getPipelinesPrerequisiteDescription(t)}
          <div className="windows-image-creation-info-alert__secondary">
            <InfoCircleIcon
              aria-hidden="true"
              className="windows-image-creation-info-alert__secondary-icon"
            />
            <div>
              <strong className="windows-image-creation-info-alert__secondary-title">
                {getWindowsImageCreationTitle(t)}
              </strong>
              <div>{getWindowsImageCreationDescription(t)}</div>
            </div>
          </div>
        </Alert>
      )}
    </StackItem>
  );
};

export default WindowsImageCreationInfoAlert;
