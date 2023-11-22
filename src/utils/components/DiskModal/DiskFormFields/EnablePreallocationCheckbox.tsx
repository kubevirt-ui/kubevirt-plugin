import * as React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type EnablePreallocationCheckboxProps = {
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  enablePreallocation: boolean;
  isDisabled: boolean;
};

const EnablePreallocationCheckbox: React.FC<EnablePreallocationCheckboxProps> = ({
  dispatchDiskState,
  enablePreallocation,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      helperText={
        <>
          <Trans ns="plugin__kubevirt-plugin">
            Refer to the
            <Link
              to={{
                pathname:
                  'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.10/html/virtualization/virtual-machines#virt-using-preallocation-for-datavolumes',
              }}
              target="_blank"
            >
              {' '}
              Documentation{' '}
            </Link>
            or contact your system administrator for more information. Enabling preallocation is
            available only for DataVolumes.
          </Trans>
        </>
      }
      fieldId="enable-preallocation"
    >
      <Checkbox
        onChange={(checked) =>
          dispatchDiskState({ payload: checked, type: diskReducerActions.SET_ENABLE_PREALLOCATION })
        }
        id="enable-preallocation"
        isChecked={enablePreallocation}
        isDisabled={isDisabled}
        label={t('Enable preallocation')}
      />
    </FormGroup>
  );
};

export default EnablePreallocationCheckbox;
