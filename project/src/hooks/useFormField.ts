/**
 * ============================================================
 * useFormField — Custom React Hook
 * ============================================================
 * Teacher's structure: /hooks/ — "Custom React hooks"
 *
 * WHY a custom hook?
 *   Hooks let us extract component logic into reusable
 *   functions. This hook encapsulates a form field's value
 *   and change handler, so any form can reuse it.
 *
 * NOTE: While the main RegistrationForm uses a Class Component
 * (to demonstrate lifecycle methods), this hook shows the
 * modern approach that functional components would use.
 * ============================================================
 */

import { useState, useCallback } from "react";

interface UseFormFieldReturn {
  value: string;
  onChange: (value: string) => void;
  reset: () => void;
}

export function useFormField(initialValue: string = ""): UseFormFieldReturn {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, onChange, reset };
}
