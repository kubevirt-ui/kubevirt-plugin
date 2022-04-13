export const DiskSource = {
  DEFAULT: {
    name: 'Default',
    selectorID: 'default',
  },
  URL: {
    name: 'URL',
    selectorID: 'http',
    value: 'https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img',
  },
  PVC: {
    name: 'PVC',
    selectorID: 'pvc',
    pvcName: '',
    pvcNS: '',
  },
  REGISTRY: {
    name: 'Registry',
    selectorID: 'registry',
    value: 'quay.io/kubevirt/fedora-with-test-tooling-container-disk:latest',
  },
};
