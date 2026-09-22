import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { render } from '@testing-library/react';

import { useUploadProgressStore } from '../uploadProgressStore';

import { getUploadLinkedResource } from '../completion/uploadLinkedResource';
import { getVmStorageUrlForIdentity } from '../completion/uploadLinks';
import { getVmDiskUploadKey } from '../keys/uploadKeys';
import UploadLinkResourceWatcherEntry from './UploadLinkResourceWatcherEntry';

jest.mock('@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockWatch = useKubevirtWatchResource as jest.Mock;

const CLUSTER = 'local-cluster';
const NAMESPACE = 'default';
const VM_NAME = 'test-vm';
const DISK_NAME = 'disk-0';
const UPLOAD_KEY = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
const storageLink = {
  label: 'View disk',
  url: getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME),
};
const vmResource = getUploadLinkedResource(VirtualMachineModel, VM_NAME, NAMESPACE, CLUSTER);

const startVmUpload = (): void => {
  useUploadProgressStore.setState({ generationsByKey: {}, uploads: {} });
  useUploadProgressStore.getState().startUpload(UPLOAD_KEY, {
    contextLinks: [storageLink],
    fileName: 'image.iso',
  });
};

describe('UploadLinkResourceWatcherEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    startVmUpload();
  });

  afterEach(() => {
    useUploadProgressStore.setState({ generationsByKey: {}, uploads: {} });
  });

  it('should not strip links for a first-watch 404 before the resource exists', () => {
    mockWatch.mockReturnValue([undefined, true, { code: 404 }]);

    render(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.contextLinks).toEqual([
      storageLink,
    ]);
  });

  it('should strip VM storage links when a previously observed resource returns 404', () => {
    mockWatch.mockReturnValue([{ metadata: { name: VM_NAME } }, true, undefined]);
    const { rerender } = render(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    mockWatch.mockReturnValue([undefined, true, { code: 404 }]);
    rerender(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.contextLinks).toEqual([]);
  });

  it('should strip VM storage links when the resource has a deletionTimestamp', () => {
    mockWatch.mockReturnValue([
      { metadata: { deletionTimestamp: '2026-09-17T12:00:00Z', name: VM_NAME } },
      true,
      undefined,
    ]);

    render(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.contextLinks).toEqual([]);
  });

  it('should not strip links for a healthy resource', () => {
    mockWatch.mockReturnValue([{ metadata: { name: VM_NAME } }, true, undefined]);

    render(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.contextLinks).toEqual([
      storageLink,
    ]);
  });

  it('should not strip links for a non-404 watch error', () => {
    mockWatch.mockReturnValue([undefined, true, { code: 403 }]);

    render(<UploadLinkResourceWatcherEntry resource={vmResource} />);

    expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.contextLinks).toEqual([
      storageLink,
    ]);
  });
});
