import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const parseNestedJSON = <T>(str: string): T => {
  try {
    return JSON.parse(str, (_, val) => {
      if (typeof val === 'string') return parseNestedJSON(val);
      return val;
    });
  } catch (exc) {
    return (<unknown>str) as T;
  }
};

export const patchUserConfigMap = async (
  userConfigMap: IoK8sApiCoreV1ConfigMap,
  userName: string,
  data: { [key: string]: any },
  cluster?: string,
) =>
  kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
    cluster,
    data: [
      ...(isEmpty(userConfigMap.data) ? [{ op: 'add', path: '/data', value: {} }] : []),
      {
        op: 'replace',
        path: `/data/${userName}`,
        value: JSON.stringify(data),
      },
    ],
    model: ConfigMapModel,
    resource: userConfigMap,
  });
