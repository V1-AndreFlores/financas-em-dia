import { useState } from 'react';
import type { TextInputProps } from 'react-native';

import {
  formatBrDateInput,
  getBrDateValidationError,
} from '../../shared/utils/date';
import { FormTextInput } from './FormTextInput';

interface DateInputProps
  extends Omit<TextInputProps, 'keyboardType' | 'maxLength' | 'onChangeText' | 'value'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}

export function DateInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder = 'dd/MM/aaaa',
  ...props
}: DateInputProps) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const validationError =
    hasBlurred && value.length > 0 ? getBrDateValidationError(value) : null;

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setHasBlurred(true);
    onBlur?.(event);
  };

  const handleChangeText = (input: string) => {
    onChangeText(formatBrDateInput(input));
  };

  return (
    <FormTextInput
      {...props}
      label={label}
      keyboardType="number-pad"
      maxLength={10}
      onBlur={handleBlur}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      value={value}
      errorMessage={validationError ?? undefined}
    />
  );
}
