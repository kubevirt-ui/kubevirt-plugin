import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

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
) =>
  k8sPatch<IoK8sApiCoreV1ConfigMap>({
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
