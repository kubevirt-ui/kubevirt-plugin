import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Checkbox,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupText,
  Popover,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './grace-period-input.scss';

interface GracePeriodInputProps {
  gracePeriodSeconds: null | number;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  setGracePeriodSeconds: (newGracePeriod: null | number) => void;
}

export const GracePeriodInput: FC<GracePeriodInputProps> = ({
  gracePeriodSeconds,
  isChecked,
  onCheckboxChange,
  setGracePeriodSeconds,
}) => {
  const { t } = useTranslation();

  return (
    <StackItem>
      <Flex alignItems={{ default: 'alignItemsCenter' }} className="grace-period-input">
        <FlexItem>
          <Checkbox
            id="grace-period-checkbox"
            isChecked={isChecked}
            label={t('With grace period')}
            onChange={onCheckboxChange}
          />
        </FlexItem>
        <FlexItem>
          <Popover
            bodyContent={
              <div>
                {t(
                  'The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.',
                )}
              </div>
            }
          >
            <HelpIcon />
          </Popover>
        </FlexItem>

        {isChecked && (
          <FlexItem>
            <InputGroup>
              <TextInput
                aria-label={t('seconds')}
                data-test="grace-period-seconds-input"
                min={0}
                onChange={(value) => setGracePeriodSeconds(isEmpty(value) ? null : parseInt(value))}
                type="number"
                value={gracePeriodSeconds}
              />
              <InputGroupText>{t('seconds')}</InputGroupText>
            </InputGroup>
          </FlexItem>
        )}
      </Flex>
    </StackItem>
  );
};
