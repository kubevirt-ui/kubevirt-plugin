import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, PopoverPosition, Skeleton, Truncate } from '@patternfly/react-core';

type CheckupImageFieldProps = {
  checkupImage?: string;
  checkupImageLoaded: boolean;
  checkupImageLoadError?: Error;
};

const CheckupImageField: FC<CheckupImageFieldProps> = ({
  checkupImage,
  checkupImageLoaded,
  checkupImageLoadError,
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
      {checkupImageLoadError && <ErrorAlert error={checkupImageLoadError} />}
    </FormGroup>
  );
};

export default CheckupImageField;
