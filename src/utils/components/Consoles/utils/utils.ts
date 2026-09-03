import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

export const isConnectionEncrypted = (): boolean => window.location.protocol === 'https:';

export const getConsoleBasePath = ({ apiPath = '/api/kubernetes', name, namespace }): string =>
  `${apiPath}/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`;

export const sleep = (delay = 500): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const readFromClipboard = async (): Promise<string | void> =>
  navigator.clipboard
    .readText()
    .catch((err) => kubevirtConsole.error('Failed to read from clipboard', err));

export const writeToClipboard = async (text: string): Promise<void> =>
  navigator.clipboard
    .writeText(text)
    .catch((err) => kubevirtConsole.error('Failed to write to clipboard', err));
