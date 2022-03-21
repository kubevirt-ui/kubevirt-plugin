import * as React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions } from '../reducer/actions';

type EnablePreallocationCheckboxProps = {
  enablePreallocation: boolean;
  dispatch: React.Dispatch<any>;
  isDisabled: boolean;
};

const EnablePreallocationCheckbox: React.FC<EnablePreallocationCheckboxProps> = ({
  enablePreallocation,
  dispatch,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      fieldId="enable-preallocation"
      helperText={
        <>
          <Trans ns="plugin__kubevirt-plugin">
            Refer to the
            <Link to="https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/virtualization/virtual-machines#virt-using-preallocation-for-datavolumes">
              {' '}
              Documentation{' '}
            </Link>
            or contact your system administrator for more information. Enabling preallocation is
            available only for blank disk source.
          </Trans>
        </>
      }
    >
      <Checkbox
        id="enable-preallocation"
        label={t('Enable preallocation')}
        isChecked={enablePreallocation}
        onChange={(checked) =>
          dispatch({ type: diskReducerActions.SET_ENABLE_PREALLOCATION, payload: checked })
        }
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
};

export default EnablePreallocationCheckbox;
