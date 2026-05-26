import { useState } from 'react';
import { useNavigate } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { logTemplateCreated } from '@kubevirt-utils/extensions/telemetry/templates';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  getTemplateListURL,
} from '@kubevirt-utils/resources/template/utils/url';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getWorkload } from '@kubevirt-utils/resources/vm/utils/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';

import { createVMTemplateRequest } from '../../../views/templates/components/VirtualMachineTemplateRequest/utils';

const useSaveAsTemplateModal = (vm: V1VirtualMachine) => {
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();

  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const [templateName, setTemplateName] = useState(`${vmName}-template`);
  const [selectedProject, setSelectedProject] = useState(vmNamespace);

  const onSubmit = async () => {
    await createVMTemplateRequest(vm, templateName, selectedProject);
    logTemplateCreated({
      osType: getOperatingSystem(vm),
      sourceVmId: getUID(vm),
      workloadProfile: getWorkload(vm),
    });
    navigate(isACMPage ? getACMTemplateListURL() : getTemplateListURL(selectedProject));
  };

  return {
    onSubmit,
    selectedProject,
    setSelectedProject,
    setTemplateName,
    templateName,
  };
};

export default useSaveAsTemplateModal;
