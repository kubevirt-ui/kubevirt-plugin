import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, PopoverPosition } from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import { enablePreallocationField, enablePreallocationFieldID } from '../utils/constants';

type EnablePreallocationCheckboxProps = {
  isDisabled: boolean;
};

const EnablePreallocationCheckbox: FC<EnablePreallocationCheckboxProps> = ({ isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<DiskFormState>();

  return (
    <FormGroup fieldId={enablePreallocationFieldID}>
      <Flex>
        <FlexItem>
          <Controller
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id={enablePreallocationFieldID}
                isChecked={value}
                isDisabled={isDisabled}
                label={t('Enable preallocation')}
                onChange={(_, checked) => onChange(checked)}
              />
            )}
            control={control}
            name={enablePreallocationField}
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
