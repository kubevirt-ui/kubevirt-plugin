import { type Dispatch, type SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { logTemplateCreated } from '@kubevirt-utils/extensions/telemetry/templates';
import useIsHyperConvergedV1Available from '@kubevirt-utils/resources/hyperconverged/hooks/useIsHyperConvergedV1Available';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  getTemplateListURL,
} from '@kubevirt-utils/resources/template/utils/url';
import { createVMTemplateRequest } from '@kubevirt-utils/resources/template/utils/vmTemplateRequest';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getWorkload } from '@kubevirt-utils/resources/vm/utils/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';

type UseSaveAsTemplateModal = {
  category: string;
  categoryEnabledLoading: boolean;
  isCategoryEnabled: boolean;
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

  const { isHCOV1, loading: isHCOV1Loading } = useIsHyperConvergedV1Available(getCluster(vm));

  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const [templateName, setTemplateName] = useState(`${vmName}-template`);
  const [selectedProject, setSelectedProject] = useState(vmNamespace);
  const [category, setCategory] = useState('');

  const onSubmit = async (): Promise<void> => {
    await createVMTemplateRequest({
      category: category || undefined,
      isHCOV1,
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
    categoryEnabledLoading: isHCOV1Loading,
    isCategoryEnabled: isHCOV1 && !isHCOV1Loading,
    onSubmit,
    selectedProject,
    setCategory,
    setSelectedProject,
    setTemplateName,
    templateName,
  };
};

export default useSaveAsTemplateModal;
