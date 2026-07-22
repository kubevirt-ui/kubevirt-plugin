import React, { ChangeEvent, FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  NumberInput,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { MEMORY_REQUEST_RATIO_MAX, MEMORY_REQUEST_RATIO_MIN } from '../utils/const';
import { getRatioLevel, getRatioLevelConfig, isValidRatio } from '../utils/utils';

import RequestRatioHelpContent from './RequestRatioHelpContent';

type MemoryRequestRatioInputProps = {
  hasChanged: boolean;
  inputValue: number;
  isLoading: boolean;
  onChange: (value: number) => void;
  onRestoreDefault: () => void;
  onSave: () => void;
};

const MemoryRequestRatioInput: FC<MemoryRequestRatioInputProps> = ({
  hasChanged,
  inputValue,
  isLoading,
  onChange,
  onRestoreDefault,
  onSave,
}) => {
  const { t } = useKubevirtTranslation();

  const isValid = isValidRatio(inputValue);
  const ratioLevel = isValid ? getRatioLevel(inputValue) : null;
  const levelConfig = ratioLevel ? getRatioLevelConfig(t)[ratioLevel] : null;

  return (
    <Form>
      <FormGroup
        fieldId="memory-request-ratio"
        label={t('Request ratio')}
        labelHelp={
          <HelpTextIcon
            bodyContent={<RequestRatioHelpContent />}
            headerContent={t('Request ratio')}
          />
        }
      >
        <Stack hasGutter>
          <StackItem>
            <NumberInput
              inputAriaLabel={t('Memory request ratio percentage')}
              inputName="memory-request-ratio"
              isDisabled={isLoading}
              max={MEMORY_REQUEST_RATIO_MAX}
              min={MEMORY_REQUEST_RATIO_MIN}
              minusBtnAriaLabel={t('Decrease ratio')}
              minusBtnProps={{ isDisabled: isLoading || inputValue <= MEMORY_REQUEST_RATIO_MIN }}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(Number(event.target.value))
              }
              onMinus={() => onChange(inputValue - 1)}
              onPlus={() => onChange(inputValue + 1)}
              plusBtnAriaLabel={t('Increase ratio')}
              plusBtnProps={{ isDisabled: isLoading || inputValue >= MEMORY_REQUEST_RATIO_MAX }}
              unit="%"
              value={inputValue}
            />
          </StackItem>

          {!isValid && (
            <StackItem>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">
                    {t('Enter a value from 25 to 100.')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </StackItem>
          )}

          {levelConfig && (
            <StackItem>
              <div className="memory-density__ratio-level-indicator">
                <span
                  className="memory-density__ratio-level-dot"
                  style={{ backgroundColor: levelConfig.color }}
                />
                <Content component={ContentVariants.small}>{levelConfig.label}</Content>
              </div>
            </StackItem>
          )}

          {hasChanged && (
            <StackItem>
              <Split hasGutter>
                <SplitItem>
                  <Button
                    isDisabled={isLoading || !isValid}
                    isLoading={isLoading}
                    onClick={onSave}
                    variant="secondary"
                  >
                    {t('Save')}
                  </Button>
                </SplitItem>
                <SplitItem>
                  <Button
                    isDisabled={isLoading}
                    onClick={onRestoreDefault}
                    variant={ButtonVariant.link}
                  >
                    {t('Restore default')}
                  </Button>
                </SplitItem>
              </Split>
            </StackItem>
          )}
        </Stack>
      </FormGroup>
    </Form>
  );
};

export default MemoryRequestRatioInput;
