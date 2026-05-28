import { useLocation, useParams } from 'react-router';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { Template } from '@kubevirt-utils/resources/template';
import {
  TemplateModelGroupVersionKind,
  VirtualMachineTemplateGroupVersionKind,
} from '@kubevirt-utils/resources/template/hooks/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const VMT_PATH_SEGMENT = '/vmt/';
const VMT_KIND = 'VirtualMachineTemplate';

const useTemplateWatch = (): [template: Template, loaded: boolean, isVMT: boolean] => {
  const { name } = useParams<{ name: string }>();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const { pathname } = useLocation();

  const isVMT = pathname.includes(VMT_KIND) || pathname.includes(VMT_PATH_SEGMENT);

  const groupVersionKind = isVMT
    ? VirtualMachineTemplateGroupVersionKind
    : TemplateModelGroupVersionKind;

  const [template, loaded] = useK8sWatchData<Template>({
    cluster,
    groupVersionKind,
    name,
    namespace,
  });

  return [template, loaded, isVMT];
};

export default useTemplateWatch;
