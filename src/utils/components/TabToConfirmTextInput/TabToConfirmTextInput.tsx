import React, {
  FCC,
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { TAB } from '@kubevirt-utils/hooks/useClickOutside/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Label, TextInput, ValidatedOptions } from '@patternfly/react-core';

import './TabToConfirmTextInput.scss';

type TabToConfirmTextInputProps = {
  autoFocus?: boolean;
  className?: string;
  fieldId: string;
  helperText?: ReactNode;
  isRequired?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  onConfirm: () => void;
  placeholder?: string;
  validated?: ValidatedOptions;
  value?: string;
};

const TabToConfirmTextInput: FCC<TabToConfirmTextInputProps> = ({
  autoFocus = false,
  className,
  fieldId,
  helperText,
  isRequired = false,
  label,
  onChange,
  onConfirm,
  placeholder,
  validated = ValidatedOptions.default,
  value = '',
}) => {
  const { t } = useKubevirtTranslation();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (event.key === TAB && isFocused && !isConfirmed) {
      event.preventDefault();
      setIsConfirmed(true);
      onConfirm();
    }
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const handleChange = (_event: FormEvent<HTMLInputElement>, newValue: string): void => {
    onChange?.(newValue);
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
          validated={validated}
          value={value}
        />
        {isFocused && !isConfirmed && (
          <Label className="tab-to-confirm-text-input__badge" isCompact>
            {t('Tab')}
          </Label>
        )}
      </div>
      {helperText && <FormGroupHelperText validated={validated}>{helperText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default TabToConfirmTextInput;
