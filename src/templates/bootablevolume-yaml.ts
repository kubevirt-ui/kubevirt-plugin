import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';

export const defaultBootableVolumeYamlTemplate = `
apiVersion: ${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}
kind: ${DataVolumeModel.kind}
metadata:
  name: example
  labels:
    instancetype.kubevirt.io/default-instancetype: u1.medium
    instancetype.kubevirt.io/default-preference: fedora
  annotations:
    cdi.kubevirt.io/storage.bind.immediate.requested: 'true'
spec:
  source:
    registry:
      url: docker://quay.io/containerdisks/fedora:latest
  storage:
    resources:
      requests:
        storage: 30Gi
`;
