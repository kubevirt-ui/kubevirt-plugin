import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  FormGroup,
  PopoverPosition,
  Skeleton,
  Truncate,
} from '@patternfly/react-core';

type CheckupImageFieldProps = {
  checkupImage?: string;
  checkupImageLoaded: boolean;
  checkupImageLoadError?: Error;
  isFallback?: boolean;
};

const CheckupImageField: FC<CheckupImageFieldProps> = ({
  checkupImage,
  checkupImageLoaded,
  checkupImageLoadError,
  isFallback,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={t('The image used by the checkup job.')}
          position={PopoverPosition.right}
        />
      }
      label={t('Checkup image')}
    >
      {!checkupImageLoaded && <Skeleton screenreaderText={t('Loading checkup image')} />}
      {checkupImageLoaded && <Truncate content={checkupImage ?? ''} />}
      {isFallback && !checkupImageLoadError && (
        <div className="pf-v6-u-mt-sm">
          <Alert isInline title={t('Using default checkup image')} variant={AlertVariant.warning}>
            {t(
              'The checkup image could not be determined from the cluster. A default image is being used.',
            )}
          </Alert>
        </div>
      )}
      {checkupImageLoadError && <ErrorAlert error={checkupImageLoadError} />}
    </FormGroup>
  );
};

export default CheckupImageField;
