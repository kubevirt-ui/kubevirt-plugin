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
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  gracePeriodSeconds: number | null;
  setGracePeriodSeconds: (newGracePeriod: number | null) => void;
}

export const GracePeriodInput: FC<GracePeriodInputProps> = ({
  isChecked,
  onCheckboxChange,
  gracePeriodSeconds,
  setGracePeriodSeconds,
}) => {
  const { t } = useTranslation();

  return (
    <StackItem>
      <Flex alignItems={{ default: 'alignItemsCenter' }} className="grace-period-input">
        <FlexItem>
          <Checkbox
            onChange={onCheckboxChange}
            isChecked={isChecked}
            id="grace-period-checkbox"
            label={t('With grace period')}
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
                type="number"
                value={gracePeriodSeconds}
                onChange={(value) => setGracePeriodSeconds(isEmpty(value) ? null : parseInt(value))}
                min={0}
                aria-label={t('seconds')}
                data-test="grace-period-seconds-input"
              />
              <InputGroupText>{t('seconds')}</InputGroupText>
            </InputGroup>
          </FlexItem>
        )}
      </Flex>
    </StackItem>
  );
};
