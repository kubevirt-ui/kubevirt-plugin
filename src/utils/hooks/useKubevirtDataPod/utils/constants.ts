export const PROXY_KUBEVIRT_URL = `/api/proxy/plugin/${
  process?.env?.NODE_ENV === 'development' ? 'console-plugin-kubevirt' : 'kubevirt-plugin'
}/kubevirt-apiserver-proxy/`;

export const PROXY_KUBEVIRT_URL_HEALTH_PATH = 'health';
