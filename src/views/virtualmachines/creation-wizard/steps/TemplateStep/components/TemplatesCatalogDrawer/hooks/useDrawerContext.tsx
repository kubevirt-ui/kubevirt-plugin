import React, { createContext, FC, useContext, useEffect, useMemo } from 'react';
import { Updater, useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { useVMTemplateSource } from '@kubevirt-utils/resources/template';
import useVMTemplateGeneratedParams from '@kubevirt-utils/resources/template/hooks/useVMTemplateGeneratedParams';

export type DrawerContext = {
  setTemplate: Updater<Template>;
  template: Template;
  templateDataLoaded: boolean;
  templateLoadingError: Error;
  vm: V1VirtualMachine;
};

const useDrawer = (initialTemplate: Template) => {
  const [template, setTemplate] = useImmer(initialTemplate);
  const [templateWithGeneratedParams, loading, error] =
    useVMTemplateGeneratedParams(initialTemplate);
  const { loaded: bootSourceLoaded } = useVMTemplateSource(initialTemplate);

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

  return {
    setTemplate,
    template: template || initialTemplate,
    templateDataLoaded: !!templateWithGeneratedParams && !loading && bootSourceLoaded,
    templateLoadingError: error,
    vm,
  };
};

const initialValue: DrawerContext = {
  setTemplate: () => null,
  template: null,
  templateDataLoaded: false,
  templateLoadingError: null,
  vm: null,
};

export const DrawerContext = createContext<DrawerContext>(initialValue);

export const DrawerContextProvider: FC<{ template: Template }> = ({ children, template }) => {
  const context = useDrawer(template);
  return <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>;
};

export const useDrawerContext = () => useContext(DrawerContext);
