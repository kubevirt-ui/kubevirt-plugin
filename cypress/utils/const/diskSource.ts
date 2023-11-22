export const DiskSource = {
  DEFAULT: {
    name: 'Default',
    selectorID: 'default',
  },
  PVC: {
    name: 'PVC',
    pvcName: '',
    pvcNS: '',
    selectorID: 'pvc',
  },
  REGISTRY: {
    name: 'Registry',
    selectorID: 'registry',
    value: 'quay.io/kubevirt/fedora-with-test-tooling-container-disk:latest',
  },
  URL: {
    name: 'URL',
    selectorID: 'http',
    value: 'https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img',
  },
};
