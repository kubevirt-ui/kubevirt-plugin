import { SecretModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

import { changeSSHKeySecret } from '../components/SSHKey/sshkey-utils';

import { getMockTemplate } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sUpdate: jest.fn(({ data: template }) => Promise.resolve(template)),
}));

const template = getMockTemplate();
const someExternalSecretName = 'some-external-secret';

const sshkey = 'testtest';
describe('sshkey-utils tests', () => {
  describe('changeSSHKeySecret test ', () => {
    it('add ssh key and change it to existing secret', async () => {
      const templateWithSecret = (await changeSSHKeySecret(
        template,
        undefined,
        sshkey,
        '',
      )) as V1Template;

      const secret = templateWithSecret.objects.find(
        (object) => object.kind === SecretModel.kind,
      ) as IoK8sApiCoreV1Secret;

      expect(secret.data.key).toBe(btoa(sshkey));

      const templateWithoutSecret = (await changeSSHKeySecret(
        templateWithSecret,
        someExternalSecretName,
        undefined,
        secret.metadata.name,
      )) as V1Template;

      expect(
        templateWithoutSecret.objects.find((object) => object.kind === SecretModel.kind),
      ).toBeUndefined();

      const vm = getTemplateVirtualMachineObject(templateWithoutSecret);

      const vmAttachedSecretName =
        vm?.spec?.template?.spec?.accessCredentials?.[0].sshPublicKey?.source?.secret?.secretName;

      expect(vmAttachedSecretName).toBe(someExternalSecretName);
    });

    it('add existing secret and change it to ssh key', async () => {
      const templateWithExternalSecret = (await changeSSHKeySecret(
        template,
        someExternalSecretName,
        undefined,
        undefined,
      )) as V1Template;

      const externalSecretName = getTemplateVirtualMachineObject(templateWithExternalSecret)?.spec
        ?.template?.spec?.accessCredentials?.[0].sshPublicKey?.source?.secret?.secretName;

      expect(externalSecretName).toBe(someExternalSecretName);

      const templateWithKey = (await changeSSHKeySecret(
        templateWithExternalSecret,
        undefined,
        sshkey,
        someExternalSecretName,
      )) as V1Template;

      const secret = templateWithKey.objects.find(
        (object) => object.kind === SecretModel.kind,
      ) as IoK8sApiCoreV1Secret;

      expect(secret.data.key).toBe(btoa(sshkey));
    });

    it('add existing secret and remove it', async () => {
      const templateWithExternalSecret = (await changeSSHKeySecret(
        template,
        someExternalSecretName,
        undefined,
        undefined,
      )) as V1Template;

      const externalSecretName = getTemplateVirtualMachineObject(templateWithExternalSecret)?.spec
        ?.template?.spec?.accessCredentials?.[0].sshPublicKey?.source?.secret?.secretName;

      expect(externalSecretName).toBe(someExternalSecretName);

      const templateNoCredential = (await changeSSHKeySecret(
        templateWithExternalSecret,
        undefined,
        undefined,
        someExternalSecretName,
      )) as V1Template;

      expect(
        getTemplateVirtualMachineObject(templateNoCredential)?.spec?.template?.spec
          ?.accessCredentials?.[0]?.sshPublicKey?.source?.secret?.secretName,
      ).toBeUndefined();
    });
  });
});
