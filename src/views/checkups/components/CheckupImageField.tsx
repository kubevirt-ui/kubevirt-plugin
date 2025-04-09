import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  FormGroup,
  Popover,
  PopoverPosition,
  Skeleton,
  Truncate,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

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
        <Popover
          bodyContent={t('The image used by the checkup job.')}
          position={PopoverPosition.right}
        >
          <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
        </Popover>
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
