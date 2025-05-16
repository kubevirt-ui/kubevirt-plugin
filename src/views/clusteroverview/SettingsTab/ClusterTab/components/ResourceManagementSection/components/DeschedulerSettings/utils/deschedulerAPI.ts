import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { defaultDescheduler } from './constants';
import { DeschedulerValue } from './types';

export const createDefaultDescheduler = async () => {
  await k8sCreate({
    data: defaultDescheduler,
    model: KubeDeschedulerModel,
  });
};

export const deleteDescheduler = async () => {
  await k8sDelete({
    model: KubeDeschedulerModel,
    resource: defaultDescheduler,
  });
};

const modifyDeschedulerValue = async (
  path: string,
  op: 'add' | 'remove' | 'replace',
  newValue?: DeschedulerValue,
) => {
  await k8sPatch({
    data: [
      {
        op,
        path,
        value: newValue,
      },
    ],
    model: KubeDeschedulerModel,
    resource: defaultDescheduler,
  });
};

export const updateDeschedulerValue = async (path: string, newValue: DeschedulerValue) => {
  await modifyDeschedulerValue(path, 'replace', newValue);
};

export const addDeschedulerValue = async (path: string, newValue: DeschedulerValue) => {
  await modifyDeschedulerValue(path, 'add', newValue);
};

export const removeDeschedulerValue = async (path: string) => {
  await modifyDeschedulerValue(path, 'remove');
};
