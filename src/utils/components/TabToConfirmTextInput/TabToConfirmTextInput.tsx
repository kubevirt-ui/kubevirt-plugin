import React, { FC, FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { TFunction } from 'i18next';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { TAB } from '@kubevirt-utils/hooks/useClickOutside/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Label, TextInput, ValidatedOptions } from '@patternfly/react-core';

import './TabToConfirmTextInput.scss';

type TabToConfirmTextInputProps = {
  autoFocus?: boolean;
  className?: string;
  defaultInteracted?: boolean;
  fieldId: string;
  helperText?: ReactNode;
  isRequired?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  setIsValid: (valid: boolean) => void;
  validator?: (value: string) => (t: TFunction) => string;
  value?: string;
};

const TabToConfirmTextInput: FC<TabToConfirmTextInputProps> = ({
  autoFocus = false,
  className,
  defaultInteracted = false,
  fieldId,
  helperText,
  isRequired = false,
  label,
  onChange,
  placeholder,
  setIsValid,
  validator,
  value = '',
}) => {
  const { t } = useKubevirtTranslation();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(defaultInteracted);
  const [errorText, setErrorText] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (nameValue: string): void => {
    if (validator) {
      const error = validator(nameValue);
      if (error) {
        setErrorText(error(t));
        setIsValid(false);
        return;
      }
    }
    setErrorText(undefined);
    setIsValid(true);
  };

  useEffect(() => {
    if (defaultInteracted) validate(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoFocus || !inputRef.current) return;

    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Use IntersectionObserver to focus when element becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            // Element is visible, focus it
            requestAnimationFrame(focusInput);
            // Disconnect after focusing once
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );

    if (inputRef.current) {
      observer.observe(inputRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [autoFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === TAB && isFocused && !hasInteracted) {
      event.preventDefault();
      setHasInteracted(true);
      validate(value);
    }
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const handleChange = (_event: FormEvent<HTMLInputElement>, newValue: string): void => {
    if (!hasInteracted) setHasInteracted(true);
    onChange?.(newValue);
    validate(newValue);
  };

  return (
    <FormGroup className={className} fieldId={fieldId} isRequired={isRequired} label={label}>
      <div className="tab-to-confirm-text-input">
        <TextInput
          className="tab-to-confirm-text-input__input"
          id={fieldId}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          validated={errorText ? ValidatedOptions.error : ValidatedOptions.default}
          value={value}
        />
        {isFocused && !hasInteracted && (
          <Label className="tab-to-confirm-text-input__badge" isCompact>
            {t('Tab')}
          </Label>
        )}
      </div>
      {!hasInteracted && helperText && <FormGroupHelperText>{helperText}</FormGroupHelperText>}
      {errorText && (
        <FormGroupHelperText validated={ValidatedOptions.error}>{errorText}</FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default TabToConfirmTextInput;
