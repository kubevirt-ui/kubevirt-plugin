import { type FC, type PropsWithChildren, useMemo } from 'react';
import {
  FormProvider,
  type Resolver,
  useForm,
  useFormContext,
  type UseFormReturn,
} from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { createBootableVolumeWizardDefaultValues } from './defaultValues';
import { createBootableVolumeWizardSchema } from './schema/createBootableVolumeWizardSchema';
import type { BootableVolumeWizardFormValues, BootableVolumeWizardInitialValues } from './types';

type BootableVolumeWizardFormContextValue = UseFormReturn<BootableVolumeWizardFormValues> & {
  cluster: string;
};

type BootableVolumeWizardFormProviderProps = PropsWithChildren<{
  initialValues?: BootableVolumeWizardInitialValues;
}>;

export const BootableVolumeWizardFormProvider: FC<BootableVolumeWizardFormProviderProps> = ({
  children,
  initialValues = {},
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const activeCluster = useSelectedCluster();
  const namespace = getValidNamespace(activeNamespace);

  const defaultValues = useMemo(
    () =>
      createBootableVolumeWizardDefaultValues({
        lockedPreference: initialValues.lockedPreference,
        namespace: initialValues.namespace ?? namespace,
      }),
    [initialValues.lockedPreference, initialValues.namespace, namespace],
  );

  const schema = useMemo(() => createBootableVolumeWizardSchema(t), [t]);
  const resolver = useMemo(
    () => yupResolver(schema) as Resolver<BootableVolumeWizardFormValues>,
    [schema],
  );

  const cluster = initialValues.cluster ?? activeCluster;

  const methods = useForm<BootableVolumeWizardFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver,
    reValidateMode: 'onChange',
  });

  const formContextValue = useMemo(() => ({ ...methods, cluster }), [cluster, methods]);

  return <FormProvider {...formContextValue}>{children}</FormProvider>;
};

export const useBootableVolumeWizardForm = (): BootableVolumeWizardFormContextValue => {
  return useFormContext<BootableVolumeWizardFormValues>() as BootableVolumeWizardFormContextValue;
};
