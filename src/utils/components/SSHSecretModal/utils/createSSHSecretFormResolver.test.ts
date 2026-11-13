import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import { initialSSHCredentials } from './constants';
import { createSSHSecretFormResolver } from './createSSHSecretFormResolver';
import { SecretSelectionOption, type SSHSecretDetails } from './types';

const t = ((key: string) => key) as TFunction;

const resolver = createSSHSecretFormResolver({ namespace: 'target-ns', secrets: [], t });

const resolverOptions = {
  criteriaMode: 'firstError' as const,
  fields: {},
  names: [] as (keyof SSHSecretDetails)[],
  shouldUseNativeValidation: false as const,
};

const runResolver = (values: SSHSecretDetails) => {
  const result = resolver(values, undefined, resolverOptions);
  if ('then' in result) {
    throw new Error('Expected sync resolver result');
  }
  return result;
};

describe('createSSHSecretFormResolver', () => {
  it('allows None without fields', () => {
    const result = runResolver(initialSSHCredentials);
    expect(result.errors).toEqual({});
  });

  it('requires secret name for UseExisting in the same namespace', () => {
    const result = runResolver({
      ...initialSSHCredentials,
      secretOption: SecretSelectionOption.UseExisting,
      sshSecretNamespace: 'target-ns',
    });
    expect(result.errors.sshSecretName).toBeDefined();
  });

  it('validates copy flow (UseExisting + foreign namespace) like AddNew', () => {
    const existingSecret: IoK8sApiCoreV1Secret = {
      data: { key: 'abc' },
      metadata: { name: 'taken', namespace: 'target-ns' },
    };
    const copyResolver = createSSHSecretFormResolver({
      namespace: 'target-ns',
      secrets: [existingSecret],
      t,
    });
    const copyResult = copyResolver(
      {
        ...initialSSHCredentials,
        secretOption: SecretSelectionOption.UseExisting,
        sshPubKey: '',
        sshSecretName: 'taken',
        sshSecretNamespace: 'other-ns',
      },
      undefined,
      resolverOptions,
    );

    if ('then' in copyResult) {
      throw new Error('Expected sync resolver result');
    }

    expect(copyResult.errors.sshPubKey).toBeDefined();
    expect(copyResult.errors.sshSecretName).toBeDefined();
  });

  it('requires ssh key when browsing another project before a secret is selected', () => {
    const result = runResolver({
      ...initialSSHCredentials,
      secretOption: SecretSelectionOption.UseExisting,
      sshPubKey: '',
      sshSecretName: 'copy-name',
      sshSecretNamespace: 'source-ns',
    });

    expect(result.errors.sshPubKey).toBeDefined();
    expect(result.errors.sshSecretName).toBeUndefined();
  });
});
