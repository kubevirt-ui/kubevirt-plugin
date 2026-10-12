import { useParams } from 'react-router';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import type { Template } from '@kubevirt-utils/resources/template';
import {
  TemplateModelGroupVersionKind,
  VirtualMachineTemplateGroupVersionKind,
} from '@kubevirt-utils/resources/template/hooks/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import useIsVMTRoute from './useIsVMTRoute';

const useTemplateWatch = (): [template: Template, loaded: boolean, isVMT: boolean] => {
  const { name } = useParams<{ name: string }>();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();

  const isVMT = useIsVMTRoute();

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
