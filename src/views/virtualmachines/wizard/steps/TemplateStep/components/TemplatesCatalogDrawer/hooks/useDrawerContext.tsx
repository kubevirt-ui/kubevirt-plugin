import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useWatch } from 'react-hook-form';
import { type Updater, useImmer } from 'use-immer';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useClusterPreferencesByName from '@kubevirt-utils/hooks/useClusterPreferencesByName';
import {
  getTemplateVirtualMachineObject,
  type Template,
  useVMTemplateSource,
} from '@kubevirt-utils/resources/template';
import { useOpenShiftTemplates } from '@templates/list/hooks/useOpenShiftTemplates';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import useVMTemplateGeneratedParams from '@virtualmachines/wizard/steps/TemplateStep/hooks/useVMTemplateGeneratedParams';
import { buildOSDisplayNameMap } from '@virtualmachines/wizard/steps/TemplateStep/utils/buildOSDisplayNameMap';
import { getTemplateClusterPreference } from '@virtualmachines/wizard/steps/TemplateStep/utils/getTemplateClusterPreference';

export type DrawerContext = {
  clusterPreference: null | V1beta1VirtualMachineClusterPreference;
  osDisplayNames: Record<string, string>;
  setTemplate: Updater<Template>;
  template: Template;
  templateDataLoaded: boolean;
  templateLoadingError: Error;
  vm: V1VirtualMachine;
};

type DrawerContextProviderProps = {
  children?: ReactNode;
  template: Template;
};

const useDrawer = (initialTemplate: Template): DrawerContext => {
  const [template, setTemplate] = useImmer(initialTemplate);
  const { control } = useVMWizard();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const [templateWithGeneratedParams, loading, error] =
    useVMTemplateGeneratedParams(initialTemplate);
  const { loaded: bootSourceLoaded } = useVMTemplateSource(initialTemplate, cluster);

  const clusterPreferencesByName = useClusterPreferencesByName(cluster);
  const { templates: openShiftTemplates } = useOpenShiftTemplates({
    clusterOverride: cluster,
  });

  const osDisplayNames = useMemo(
    () => buildOSDisplayNameMap(openShiftTemplates),
    [openShiftTemplates],
  );

  const resolvedTemplate = template || initialTemplate;
  const clusterPreference = useMemo(
    () => getTemplateClusterPreference(resolvedTemplate, clusterPreferencesByName),
    [clusterPreferencesByName, resolvedTemplate],
  );

  // reset drawer template state when selected template changes
  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate, setTemplate]);

  useEffect(() => {
    if (templateWithGeneratedParams) {
      setTemplate(templateWithGeneratedParams);
    }
  }, [setTemplate, templateWithGeneratedParams]);

  const vm = useMemo(() => getTemplateVirtualMachineObject(template), [template]);

  return useMemo(
    () => ({
      clusterPreference,
      osDisplayNames,
      setTemplate,
      template: resolvedTemplate,
      templateDataLoaded: !!templateWithGeneratedParams && !loading && bootSourceLoaded,
      templateLoadingError: error,
      vm,
    }),
    [
      bootSourceLoaded,
      clusterPreference,
      error,
      loading,
      osDisplayNames,
      resolvedTemplate,
      setTemplate,
      templateWithGeneratedParams,
      vm,
    ],
  );
};

const initialValue: DrawerContext = {
  clusterPreference: null,
  osDisplayNames: {},
  setTemplate: () => null,
  template: null,
  templateDataLoaded: false,
  templateLoadingError: null,
  vm: null,
};

export const DrawerContext = createContext<DrawerContext>(initialValue);

export const DrawerContextProvider: FC<DrawerContextProviderProps> = ({ children, template }) => {
  const context = useDrawer(template);
  return <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>;
};

export const useDrawerContext: () => DrawerContext = () => useContext(DrawerContext);
