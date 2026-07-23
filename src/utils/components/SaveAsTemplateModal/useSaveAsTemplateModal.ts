import { type Dispatch, type SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { logTemplateCreated } from '@kubevirt-utils/extensions/telemetry/templates';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  getTemplateListURL,
} from '@kubevirt-utils/resources/template/utils/url';
import { createVMTemplateRequest } from '@kubevirt-utils/resources/template/utils/vmTemplateRequest';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getWorkload } from '@kubevirt-utils/resources/vm/utils/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';

type UseSaveAsTemplateModal = {
  category: string;
  onSubmit: () => Promise<void>;
  selectedProject: string;
  setCategory: Dispatch<SetStateAction<string>>;
  setSelectedProject: Dispatch<SetStateAction<string>>;
  setTemplateName: Dispatch<SetStateAction<string>>;
  templateName: string;
};

const useSaveAsTemplateModal = (vm: V1VirtualMachine): UseSaveAsTemplateModal => {
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();

  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const [templateName, setTemplateName] = useState(`${vmName}-template`);
  const [selectedProject, setSelectedProject] = useState(vmNamespace);
  const [category, setCategory] = useState('');

  const onSubmit = async (): Promise<void> => {
    await createVMTemplateRequest({
      category: category || undefined,
      templateName,
      templateNamespace: selectedProject,
      vm,
    });

    logTemplateCreated({
      osType: getOperatingSystem(vm),
      sourceVmId: getUID(vm),
      workloadProfile: getWorkload(vm),
    });
    navigate(isACMPage ? getACMTemplateListURL() : getTemplateListURL(selectedProject));
  };

  return {
    category,
    onSubmit,
    selectedProject,
    setCategory,
    setSelectedProject,
    setTemplateName,
    templateName,
  };
};

export default useSaveAsTemplateModal;
