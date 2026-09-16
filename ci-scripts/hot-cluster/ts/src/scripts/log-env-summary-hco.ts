import { KubeClient } from '../kube-client';

const CNV_NS = 'openshift-cnv';
const HCO_GROUP = 'hco.kubevirt.io';
const HCO_VERSION = 'v1beta1';

type HcoStatus = {
  status?: {
    relatedObjects?: Array<{
      name: string;
      namespace?: string;
      objectReference?: { name?: string };
      version?: string;
    }>;
    versions?: Array<{ name: string; version: string }>;
  };
};

/** Log HCO operand versions via the K8s API. */
export const logHcoOperandVersions = async (emit: (line: string) => void): Promise<void> => {
  emit('<details><summary>HCO Operand Versions</summary>\n');

  try {
    const client = KubeClient.fromKubeconfig();
    const api = client.customObjects;

    const hco = (await api.getNamespacedCustomObject({
      group: HCO_GROUP,
      name: 'kubevirt-hyperconverged',
      namespace: CNV_NS,
      plural: 'hyperconvergeds',
      version: HCO_VERSION,
    })) as unknown as HcoStatus;

    const versions = hco.status?.versions ?? [];
    if (versions.length > 0) {
      emit('| Component | Version |');
      emit('| --- | --- |');
      for (const ver of versions) {
        emit(`| ${ver.name} | ${ver.version} |`);
      }
    } else {
      emit('No operand versions found in HCO status.');
    }

    client.dispose();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    emit(`Could not retrieve HCO operand versions: ${msg}`);
  }

  emit('</details>\n');
};
