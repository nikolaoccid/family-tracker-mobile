import { useState } from 'react';
import {
  DEFAULT_CENTER,
  DEFAULT_RADIUS_M,
  validateZoneForm,
  type ZoneFormErrors,
  type ZoneFormValues,
} from '../model/zoneForm';
import { Colors } from '@/shared/ui';

export const emptyZoneForm = (): ZoneFormValues => ({
  name: '',
  radius: String(DEFAULT_RADIUS_M),
  color: Colors.primary,
  members: [],
  center: DEFAULT_CENTER,
  isActive: true,
});

export function useZoneForm(initial: ZoneFormValues = emptyZoneForm()) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<ZoneFormErrors>({});

  return {
    values,
    errors,
    change: (changes: Partial<ZoneFormValues>) => setValues((v) => ({ ...v, ...changes })),
    replace: setValues,
    /** Returns true when the form is valid, and records the errors otherwise. */
    validate: () => {
      const found = validateZoneForm(values);
      setErrors(found);
      return Object.keys(found).length === 0;
    },
  };
}
