import type KubernetesClient from '@/clients/kubernetes-client';
import type { DataVolumeConfig } from '@/data-factories';
import type { TestUtilsType } from '@/fixtures/test-utils';
import type BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';

export async function createDataVolumeWithYamlViaUi(
  bootableVolumesPage: BootableVolumesPage,
  k8sClient: KubernetesClient,
  namespace: string,
  namePrefix: string,
  utils: TestUtilsType,
  config?: Partial<DataVolumeConfig>,
): Promise<{ dataVolumeName: string }> {
  const dataVolumeName = utils.generateRandomDataVolumeName(namePrefix);
  const dvNs = config?.namespace ?? namespace;
  await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(dvNs);
  const { namespace: _omit, ...configWithoutNs } = config ?? {};
  const rawYaml = utils.DataVolumeFactory.create({
    ...configWithoutNs,
    name: dataVolumeName,
  });
  const dataVolumeYaml = rawYaml
    .split('\n')
    .filter((line) => !line.match(/^\s+namespace:\s/))
    .join('\n');
  await bootableVolumesPage.clickCreateAndSelectOption('With YAML');
  await bootableVolumesPage.fillYamlEditorAndSave(dataVolumeYaml);
  k8sClient.trackResource('DataVolume', dataVolumeName, dvNs);
  return { dataVolumeName };
}
