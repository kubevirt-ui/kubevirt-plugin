import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FormProvider,
  type Resolver,
  useForm,
  useFormContext,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form';
import produce from 'immer';
import isEqual from 'lodash/isEqual';

import { yupResolver } from '@hookform/resolvers/yup';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import useApplyAutoLabels from '@virtualmachines/wizard/hooks/useApplyAutoLabels';
import { getAdminLabelsToMerge } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { clearVMPendingUploads } from '@virtualmachines/wizard/utils/utils';

import { createVMWizardDefaultValues, type CreateVMWizardDefaultValuesArgs } from './defaultValues';
import { createVMWizardSchema } from './schema/createVMWizardSchema';
import { type VMWizardFormValues } from './types';

export type VMWizardFormResources = {
  autoAppliedLabels: readonly AutoAppliedLabel[];
  autoLabelsLoading: boolean;
};

type VMWizardFormProviderProps = {
  children: (resources: VMWizardFormResources) => ReactNode;
  initialValues?: CreateVMWizardDefaultValuesArgs;
};

const NO_LABELS: readonly AutoAppliedLabel[] = [];

export const VMWizardFormProvider: FC<VMWizardFormProviderProps> = ({
  children,
  initialValues = {},
}) => {
  const { t } = useKubevirtTranslation();
  const { cluster, creationMethod, namespace } = initialValues;

  const defaultValues = useMemo(
    () => createVMWizardDefaultValues({ cluster, creationMethod, namespace }),
    [cluster, creationMethod, namespace],
  );

  const initialSchema = useMemo(() => createVMWizardSchema({ requiredLabels: NO_LABELS }, t), [t]);

  const resolverRef = useRef(yupResolver(initialSchema) as Resolver<VMWizardFormValues>);

  const resolver = useCallback<Resolver<VMWizardFormValues>>(
    (values, context, options) => resolverRef.current(values, context, options),
    [],
  );

  const methods = useForm<VMWizardFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver,
    reValidateMode: 'onChange',
  });

  const [activeCluster, activeCreationMethod, vmDraft, autoLabelsApplied] = useWatch({
    control: methods.control,
    name: [
      'deployment.cluster',
      'creationMethod',
      'customization.vmDraft',
      'customization.autoLabelsApplied',
    ],
  });

  const {
    adminLabels,
    isLoading: autoLabelsLoading,
    userDefaults,
  } = useApplyAutoLabels(activeCluster);

  const availableLabels = autoLabelsLoading ? NO_LABELS : adminLabels;

  const schema = useMemo(
    () =>
      createVMWizardSchema({ requiredLabels: autoLabelsApplied ? availableLabels : NO_LABELS }, t),
    [autoLabelsApplied, availableLabels, t],
  );

  const initializedDraft = useMemo(() => {
    if (!vmDraft || autoLabelsLoading || autoLabelsApplied) return vmDraft;

    const labels = getAdminLabelsToMerge(adminLabels, userDefaults, vmDraft);

    if (isEqual(vmDraft.metadata?.labels ?? {}, labels)) return vmDraft;

    return produce(vmDraft, (draft) => {
      ensurePath(draft, 'metadata');

      draft.metadata.labels = labels;
    });
  }, [adminLabels, autoLabelsApplied, autoLabelsLoading, userDefaults, vmDraft]);

  const { getValues, setValue, trigger } = methods;

  useEffect(() => {
    if (!vmDraft || !initializedDraft || autoLabelsLoading || autoLabelsApplied) return;
    if (initializedDraft !== vmDraft) {
      setValue('customization.vmDraft', initializedDraft, { shouldValidate: true });
    }
    setValue('customization.autoLabelsApplied', true, { shouldValidate: true });
  }, [autoLabelsApplied, autoLabelsLoading, initializedDraft, setValue, vmDraft]);

  useEffect(() => {
    resolverRef.current = yupResolver(schema) as Resolver<VMWizardFormValues>;
    void trigger();
  }, [activeCreationMethod, defaultValues, schema, trigger]);

  useEffect(() => (): void => clearVMPendingUploads(getValues, setValue), [getValues, setValue]);

  return (
    <FormProvider {...methods}>
      {children({
        autoAppliedLabels: availableLabels,
        autoLabelsLoading: Boolean(autoLabelsLoading),
      })}
    </FormProvider>
  );
};

export const useVMWizardForm = (): UseFormReturn<VMWizardFormValues> =>
  useFormContext<VMWizardFormValues>();
