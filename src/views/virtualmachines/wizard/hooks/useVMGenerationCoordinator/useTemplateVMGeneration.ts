/* eslint-disable max-lines -- Keep template processing and its request lifecycle together. */
import { useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { logVMCreationFailedFromTemplate } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { getFirstUnfulfilledRequiredParameter } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';
import {
  getVMObjectFromTemplate,
  resolveVMFromTemplate,
} from '@virtualmachines/wizard/steps/TemplateStep/hooks/utils';

import { type GeneratedVMDraft, type GenerationScope, type TemplateVMGeneration } from './types';
import {
  getTemplateGenerationSource,
  type TemplateGenerationSource,
} from './utils/getTemplateGenerationSource';

type UseTemplateVMGenerationArgs = GeneratedVMDraft & GenerationScope;

type ActiveTemplateRequest = {
  promise: Promise<boolean>;
  snapshot: TemplateGenerationSource;
  token: object;
};

const useTemplateVMGeneration = ({
  cluster,
  creationMethod,
  isCurrentGeneratedDraft,
  project,
  publishGeneratedVM,
}: UseTemplateVMGenerationArgs): TemplateVMGeneration => {
  const { t } = useKubevirtTranslation();
  const {
    getTemplateGenerationRevision,
    setIsTemplateDrawerOpen: setDrawerOpen,
    setTemplateProcessError: setProcessError,
  } = useVMWizardState();
  const { getValues, setValue } = useVMWizardForm();
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);
  const authorizedSSHKeysRef = useRef(authorizedSSHKeys);
  const activeRequestRef = useRef<ActiveTemplateRequest | null>(null);
  const mountedRef = useRef(true);
  const scopeRef = useRef({ cluster, creationMethod, project });
  const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);

  useEffect(() => {
    if (!isEqual(scopeRef.current, { cluster, creationMethod, project })) {
      scopeRef.current = { cluster, creationMethod, project };
      activeRequestRef.current = null;
      setIsTemplateGenerating(false);
    }
  }, [cluster, creationMethod, project]);

  useEffect(() => {
    mountedRef.current = true;

    return (): void => {
      mountedRef.current = false;
      activeRequestRef.current = null;
    };
  }, []);

  useEffect(() => {
    authorizedSSHKeysRef.current = authorizedSSHKeys;
  }, [authorizedSSHKeys]);

  const failTemplateGeneration = useCallback(
    (message: string): false => {
      setProcessError(message);
      setDrawerOpen(true);

      return false;
    },
    [setDrawerOpen, setProcessError],
  );

  const ensureTemplateDraft = useCallback((): Promise<boolean> => {
    const values = getValues();
    const namespace = values.deployment.project || DEFAULT_NAMESPACE;
    const requestSnapshot = getTemplateGenerationSource(
      values,
      authorizedSSHKeys?.[namespace],
      getTemplateGenerationRevision(),
    );
    if (!requestSnapshot || !values.template.selectedTemplate) return Promise.resolve(false);

    setProcessError(null);
    const generatedDraftKey = {
      generationRevision: getTemplateGenerationRevision(),
      templateKey: getResourceKey(values.template.selectedTemplate),
    };
    if (isCurrentGeneratedDraft(generatedDraftKey)) return Promise.resolve(true);

    const processingTemplate = values.template.selectedTemplate;

    const missingParameter = getFirstUnfulfilledRequiredParameter(processingTemplate);

    if (missingParameter) {
      return Promise.resolve(
        failTemplateGeneration(
          t('{{name}} must be filled in to continue.', { name: missingParameter.name }),
        ),
      );
    }

    const activeRequest = activeRequestRef.current;
    if (activeRequest && isEqual(activeRequest.snapshot, requestSnapshot)) {
      return activeRequest.promise;
    }

    const token = {};
    const isRequestCurrent = (): boolean => {
      const currentValues = getValues();
      const currentNamespace = currentValues.deployment.project || DEFAULT_NAMESPACE;
      // The request must still be active, and its inputs must not have changed while awaiting it.
      return (
        mountedRef.current &&
        activeRequestRef.current?.token === token &&
        isEqual(
          getTemplateGenerationSource(
            currentValues,
            authorizedSSHKeysRef.current?.[currentNamespace],
            getTemplateGenerationRevision(),
          ),
          requestSnapshot,
        )
      );
    };

    const processTemplate = async (): Promise<boolean> => {
      logTemplateFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, values.template.selectedTemplate);

      try {
        const { additionalObjects, vm } = await resolveVMFromTemplate(
          processingTemplate,
          namespace,
          values.deployment.cluster,
          values.deployment.name,
        );

        const generatedVM = getVMObjectFromTemplate({
          description: values.deployment.description,
          folder: values.deployment.folder,
          namespace,
          selectedTemplate: values.template.selectedTemplate,
          sshSecretName: authorizedSSHKeys?.[namespace],
          vm,
        });

        if (!isRequestCurrent()) return false;

        publishGeneratedVM(generatedVM, generatedDraftKey);
        setValue('customization.templateAdditionalObjects', additionalObjects);

        return true;
      } catch (error) {
        if (!isRequestCurrent()) return false;

        logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, values.template.selectedTemplate);
        logVMCreationFailedFromTemplate(values.template.selectedTemplate, error);
        return failTemplateGeneration((error as Error)?.message ?? String(error));
      }
    };

    const promise = processTemplate().finally(() => {
      // An older request must not clear a newer request's loading state.
      if (activeRequestRef.current?.token === token) {
        activeRequestRef.current = null;
        if (mountedRef.current) setIsTemplateGenerating(false);
      }
    });
    activeRequestRef.current = { promise, snapshot: requestSnapshot, token };
    setIsTemplateGenerating(true);

    return promise;
  }, [
    authorizedSSHKeys,
    failTemplateGeneration,
    getTemplateGenerationRevision,
    getValues,
    isCurrentGeneratedDraft,
    publishGeneratedVM,
    setProcessError,
    setValue,
    t,
  ]);

  return { ensureTemplateDraft, isTemplateGenerating };
};

export default useTemplateVMGeneration;
