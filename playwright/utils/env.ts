/** Environment variables consumed by Playwright tests. */
export const env = {
  baseURL: (() => {
    const addr = process.env.BRIDGE_BASE_ADDRESS ?? 'http://localhost:9000';
    const path = process.env.BRIDGE_BASE_PATH ?? '/';
    return `${addr}${path}`.replace(/\/$/, '');
  })(),

  cnvNamespace: process.env.CNV_NS ?? 'openshift-cnv',
  kubeadminIdp: process.env.BRIDGE_HTPASSWD_IDP ?? 'kube:admin',
  kubeadminPassword: process.env.BRIDGE_KUBEADMIN_PASSWORD ?? '',

  kubeadminUsername: process.env.BRIDGE_HTPASSWD_USERNAME ?? 'kubeadmin',
  osImagesNamespace: process.env.OS_IMAGES_NS ?? 'openshift-virtualization-os-images',
  testNamespace: process.env.TEST_NS ?? '',
  testSecretName: process.env.TEST_SECRET_NAME ?? '',
} as const;
