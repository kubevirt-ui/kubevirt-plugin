import type RequestContextClient from '@/clients/request-context-client';
import type { KubernetesResource } from '@/data-models/kubernetes-types';

export const SYSPREP_SAMPLE_AUTOUNATTEND_XML = `<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend"></unattend>`;

export const SYSPREP_SAMPLE_UNATTEND_XML = `<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend"></unattend>`;

type VmVolume = {
  sysprep?: {
    configMap?: {
      name?: string;
    };
  };
};

export const getVmSysprepConfigMapName = (vm: KubernetesResource): string | undefined => {
  const spec = vm.spec as { template?: { spec?: { volumes?: VmVolume[] } } } | undefined;
  const sysprepVolume = spec?.template?.spec?.volumes?.find((volume) => volume?.sysprep?.configMap?.name);

  return sysprepVolume?.sysprep?.configMap?.name;
};

export const createSysprepConfigMapForTest = async (
  client: RequestContextClient,
  namespace: string,
  name: string,
): Promise<void> => {
  await client.createConfigMapResource(namespace, name, {
    'autounattend.xml': SYSPREP_SAMPLE_AUTOUNATTEND_XML,
    'unattend.xml': SYSPREP_SAMPLE_UNATTEND_XML,
  });
  client.trackResource('ConfigMap', name, namespace);
};
