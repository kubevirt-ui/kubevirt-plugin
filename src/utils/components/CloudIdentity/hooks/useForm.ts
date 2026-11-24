import { useEffect, useMemo } from 'react';
import { type Resolver, useForm as useReactHookForm, type UseFormReturn } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { createSchema } from '../utils/createSchema';

type UseFormParams = {
  compatibleServiceAccountNames: string[];
  defaultValues: CloudIdentityFormValues;
  provider: CloudIdentityProvider;
};

const useForm = ({
  compatibleServiceAccountNames,
  defaultValues,
  provider,
}: UseFormParams): UseFormReturn<CloudIdentityFormValues> => {
  const { t } = useKubevirtTranslation();

  const schema = useMemo(
    () => createSchema({ compatibleServiceAccountNames, provider, t }),
    [compatibleServiceAccountNames, provider, t],
  );

  const form = useReactHookForm<CloudIdentityFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver<CloudIdentityFormValues>(schema) as Resolver<CloudIdentityFormValues>,
  });

  const { reset, trigger } = form;

  useEffect(() => {
    void trigger('existingServiceAccountName');
  }, [compatibleServiceAccountNames, trigger]);

  useEffect(() => {
    reset(defaultValues, { keepDirtyValues: true });
  }, [defaultValues, reset]);

  return form;
};

export default useForm;
