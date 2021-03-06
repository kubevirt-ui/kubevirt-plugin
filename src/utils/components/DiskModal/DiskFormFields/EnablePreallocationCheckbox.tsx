import * as React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type EnablePreallocationCheckboxProps = {
  enablePreallocation: boolean;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isDisabled: boolean;
};

const EnablePreallocationCheckbox: React.FC<EnablePreallocationCheckboxProps> = ({
  enablePreallocation,
  dispatchDiskState,
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
    >
      <Checkbox
        id="enable-preallocation"
        label={t('Enable preallocation')}
        isChecked={enablePreallocation}
        onChange={(checked) =>
          dispatchDiskState({ type: diskReducerActions.SET_ENABLE_PREALLOCATION, payload: checked })
        }
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
};

export default EnablePreallocationCheckbox;
