import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Updater, useImmer } from 'use-immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DataUpload,
  UploadDataProps,
  useCDIUpload,
} from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
  useVMTemplateSource,
} from '@kubevirt-utils/resources/template';
import useVMTemplateGeneratedParams from '@kubevirt-utils/resources/template/hooks/useVMTemplateGeneratedParams';

import { initialValue } from './constants';

export type DrawerContext = {
  bootSourceLoaded: boolean;
  cdFile: File | string;
  cdUpload: DataUpload;
  diskFile: File | string;
  diskUpload: DataUpload;
  isBootSourceAvailable: boolean;
  setCDFile: (file: File | string) => void;
  setDiskFile: (file: File | string) => void;
  setTemplate: Updater<V1Template>;
  setVM?: (vm: V1VirtualMachine) => void;
  template: V1Template;
  templateDataLoaded: boolean;
  uploadCDData?: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  uploadDiskData?: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  vm: V1VirtualMachine;
};

const useDrawer = (template: V1Template) => {
  const [customizedTemplate, setCustomizedTemplate] = useImmer(template);
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useVMTemplateSource(template);

  const { upload: diskUpload, uploadData: uploadDiskData } = useCDIUpload();
  const { upload: cdUpload, uploadData: uploadCDData } = useCDIUpload();

  const [diskFile, setDiskFile] = useState<File | string>();
  const [cdFile, setCDFile] = useState<File | string>();

  const [templateWithGeneratedParams, error] = useVMTemplateGeneratedParams(template);

  const vm = useMemo(
    () => getTemplateVirtualMachineObject(customizedTemplate),
    [customizedTemplate],
  );

  const setVM = useCallback(
    (newVM: V1VirtualMachine) => {
      setCustomizedTemplate(replaceTemplateVM(template, newVM));
    },
    [setCustomizedTemplate, template],
  );

  useEffect(() => {
    setCustomizedTemplate(templateWithGeneratedParams);
  }, [setCustomizedTemplate, templateWithGeneratedParams]);

  return {
    bootSourceLoaded,
    cdFile,
    cdUpload,
    diskFile,
    diskUpload,
    isBootSourceAvailable,
    setCDFile,
    setDiskFile,
    setTemplate: setCustomizedTemplate,
    setVM,
    template: customizedTemplate || template,
    templateDataLoaded: templateWithGeneratedParams && !error && bootSourceLoaded,
    uploadCDData,
    uploadDiskData,
    vm,
  };
};

export const DrawerContext = createContext<DrawerContext>(initialValue);

export const DrawerContextProvider: FC<{ template: V1Template }> = ({ children, template }) => {
  const context = useDrawer(template);
  return <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>;
};

export const useDrawerContext = () => useContext(DrawerContext);
