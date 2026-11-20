import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';
import { RedhatIcon, UserIcon } from '@patternfly/react-icons';

type InstanceTypeProviderRadiosProps = {
  redHatProvided: boolean;
  setRedHatProvided: Dispatch<SetStateAction<boolean>>;
};

const InstanceTypeProviderRadios: FC<InstanceTypeProviderRadiosProps> = ({
  redHatProvided,
  setRedHatProvided,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup isStack role="radiogroup">
      <Radio
        label={
          <span>
            <RedhatIcon className="pf-v6-u-mr-sm" />
            {t('Red Hat provided')}
          </span>
        }
        id="red-hat-provided"
        isChecked={redHatProvided}
        name="instance-type-provider"
        onChange={(): void => setRedHatProvided(true)}
      />
      <Radio
        label={
          <span>
            <UserIcon className="pf-v6-u-mr-sm" />
            {t('User provided')}
          </span>
        }
        id="user-provided"
        isChecked={!redHatProvided}
        name="instance-type-provider"
        onChange={(): void => setRedHatProvided(false)}
      />
    </FormGroup>
  );
};

export default InstanceTypeProviderRadios;
