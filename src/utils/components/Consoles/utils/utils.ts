export const isConnectionEncrypted = () => window.location.protocol === 'https:';

export const clipboardCopyFunc = (
  _: React.ClipboardEvent<HTMLDivElement>,
  text?: React.ReactNode,
) => {
  const textString = text?.toString();
  navigator.clipboard.writeText(textString);
};

export const getConsoleBasePath = ({ name, namespace }) =>
  `api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`;

export const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const readFromClipboard = async () =>
  navigator.clipboard
    .readText()
    // eslint-disable-next-line no-console
    .catch((err) => console.error('Failed to read from clipboard', err));
