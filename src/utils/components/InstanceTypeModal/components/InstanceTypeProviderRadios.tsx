import { type Dispatch, type FC, type SetStateAction } from 'react';

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
        id="red-hat-provided"
        isChecked={redHatProvided}
        label={
          <span>
            <RedhatIcon className="pf-v6-u-mr-sm" />
            {t('Red Hat provided')}
          </span>
        }
        name="instance-type-provider"
        onChange={(): void => setRedHatProvided(true)}
      />
      <Radio
        id="user-provided"
        isChecked={!redHatProvided}
        label={
          <span>
            <UserIcon className="pf-v6-u-mr-sm" />
            {t('User provided')}
          </span>
        }
        name="instance-type-provider"
        onChange={(): void => setRedHatProvided(false)}
      />
    </FormGroup>
  );
};

export default InstanceTypeProviderRadios;
