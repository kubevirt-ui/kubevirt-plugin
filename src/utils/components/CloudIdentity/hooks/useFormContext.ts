import { useFormContext as useReactHookFormContext, type UseFormReturn } from 'react-hook-form';

import { type CloudIdentityFormValues } from '../types/types';

const useFormContext = (): UseFormReturn<CloudIdentityFormValues> =>
  useReactHookFormContext<CloudIdentityFormValues>();

export default useFormContext;
