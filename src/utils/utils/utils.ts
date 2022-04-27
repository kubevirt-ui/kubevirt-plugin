import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const isEmpty = (obj) =>
  [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const get = (obj, path, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const isUpstream = (window as any).SERVER_FLAGS?.branding === 'okd';

export const isString = (val) => val !== null && typeof val === 'string';

export const getSSHNodePort = (sshService: IoK8sApiCoreV1Service) =>
  sshService?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === 22)?.nodePort;

export const isTemplateParameter = (value: string): boolean => !!/^\${[A-z0-9_]+}$/.test(value);
