import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, PopoverPosition } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { ENABLE_PREALLOCATION_FIELDID, ENALBE_PREACCLOCATION_FIELD } from '../utils/constants';

type EnablePreallocationCheckboxProps = {
  isDisabled?: boolean;
};

const EnablePreallocationCheckbox: FC<EnablePreallocationCheckboxProps> = ({ isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<V1DiskFormState>();

  return (
    <FormGroup fieldId={ENABLE_PREALLOCATION_FIELDID}>
      <Flex>
        <FlexItem>
          <Controller
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id={ENABLE_PREALLOCATION_FIELDID}
                isChecked={value}
                isDisabled={isDisabled}
                label={t('Enable preallocation')}
                onChange={(_, checked) => onChange(checked)}
              />
            )}
            control={control}
            name={ENALBE_PREACCLOCATION_FIELD}
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
                        'https://docs.openshift.com/container-platform/4.15/virt/storage/virt-using-preallocation-for-datavolumes.html',
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
