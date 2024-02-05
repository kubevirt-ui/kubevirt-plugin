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
import { V1beta1DataVolumeSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import {
  DataUpload,
  UploadDataProps,
  useCDIUpload,
} from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
  useVMTemplateSource,
} from '@kubevirt-utils/resources/template';
import useVMTemplateGeneratedParams from '@kubevirt-utils/resources/template/hooks/useVMTemplateGeneratedParams';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getDiskSource } from '../StorageSection/utils';

import { initialValue } from './constants';
import useDefaultVMSource from './useDefaultVMSource';

export type DrawerContext = {
  bootSourceLoaded: boolean;
  cdFile: File | string;
  cdUpload: DataUpload;
  diskFile: File | string;
  diskUpload: DataUpload;
  isBootSourceAvailable: boolean;
  setCDFile: (file: File | string) => void;
  setDiskFile: (file: File | string) => void;
  setSSHDetails: (details: SSHSecretDetails) => void;
  setStorageClassName: (scName: string) => void;
  setTemplate: Updater<V1Template>;
  setVM?: (vm: V1VirtualMachine) => void;
  sshDetails: SSHSecretDetails;
  storageClassName: string;
  storageClassRequired: boolean;
  template: V1Template;
  templateDataLoaded: boolean;
  templateLoadingError: Error;
  uploadCDData?: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  uploadDiskData?: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  vm: V1VirtualMachine;
};

const useDrawer = (template: V1Template) => {
  const [customizedTemplate, setCustomizedTemplate] = useImmer(template);
  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(null);
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useVMTemplateSource(template);

  const { upload: diskUpload, uploadData: uploadDiskData } = useCDIUpload();
  const { upload: cdUpload, uploadData: uploadCDData } = useCDIUpload();

  const [diskFile, setDiskFile] = useState<File | string>();
  const [cdFile, setCDFile] = useState<File | string>();
  const [storageClassName, setStorageClassName] = useState<string>(null);

  const [templateWithGeneratedParams, loading, error] = useVMTemplateGeneratedParams(template);
  const [{ clusterDefaultStorageClass, virtDefaultStorageClass }] = useDefaultStorageClass();

  const vm = useMemo(
    () => getTemplateVirtualMachineObject(customizedTemplate),
    [customizedTemplate],
  );

  const templateBootSourceStorageClass = useMemo(
    () =>
      (getDiskSource(getTemplateVirtualMachineObject(template), ROOTDISK) as V1beta1DataVolumeSpec)
        ?.storage?.storageClassName,
    [template],
  );

  const { isDefaultDiskSource, updateDefaultDiskSource } = useDefaultVMSource(vm);

  const setVM = useCallback(
    (newVM: V1VirtualMachine) => {
      setCustomizedTemplate(replaceTemplateVM(customizedTemplate, newVM));
    },
    [setCustomizedTemplate, customizedTemplate],
  );

  useEffect(() => {
    updateDefaultDiskSource(getTemplateVirtualMachineObject(templateWithGeneratedParams));

    setCustomizedTemplate(templateWithGeneratedParams);
  }, [setCustomizedTemplate, templateWithGeneratedParams, updateDefaultDiskSource]);

  return {
    bootSourceLoaded,
    cdFile,
    cdUpload,
    diskFile,
    diskUpload,
    isBootSourceAvailable: isDefaultDiskSource ? isBootSourceAvailable : true,
    setCDFile,
    setDiskFile,
    setSSHDetails,
    setStorageClassName,
    setTemplate: setCustomizedTemplate,
    setVM,
    sshDetails,
    storageClassName,
    storageClassRequired:
      isEmpty(templateBootSourceStorageClass) &&
      isEmpty(getName(virtDefaultStorageClass)) &&
      isEmpty(getName(clusterDefaultStorageClass)),
    template: customizedTemplate || template,
    templateDataLoaded: !!templateWithGeneratedParams && !loading && bootSourceLoaded,
    templateLoadingError: error,
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
