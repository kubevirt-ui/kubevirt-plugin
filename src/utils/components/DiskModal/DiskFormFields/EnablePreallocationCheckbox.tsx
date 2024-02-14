import * as React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, PopoverPosition } from '@patternfly/react-core';

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
    <FormGroup fieldId="enable-preallocation">
      <Flex>
        <FlexItem>
          <Checkbox
            onChange={(checked) =>
              dispatchDiskState({
                payload: checked,
                type: diskReducerActions.SET_ENABLE_PREALLOCATION,
              })
            }
            id="enable-preallocation"
            isChecked={enablePreallocation}
            isDisabled={isDisabled}
            label={t('Enable preallocation')}
          />
        </FlexItem>
        <FlexItem>
          <HelpTextIcon
            bodyContent={
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
                  or contact your system administrator for more information. Enabling preallocation
                  is available only for DataVolumes.
                </Trans>
              </>
            }
            position={PopoverPosition.right}
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default EnablePreallocationCheckbox;
