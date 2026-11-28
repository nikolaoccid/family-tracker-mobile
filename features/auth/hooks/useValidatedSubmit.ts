import { useState } from 'react';
import type { FieldErrors } from '../model/validation';

/**
 * Validate-then-submit for the auth forms: clears the server error, records field errors,
 * and only calls `submit` when the values are valid.
 */
export function useValidatedSubmit<K extends string, V>(
  values: V,
  validate: (values: V) => FieldErrors<K>,
  submit: (values: V) => Promise<unknown>,
  clearError: () => void,
) {
  const [errors, setErrors] = useState<FieldErrors<K>>({});

  const onSubmit = async () => {
    clearError();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) await submit(values);
  };

  return { errorFor: (field: K) => errors[field] ?? '', onSubmit };
}
